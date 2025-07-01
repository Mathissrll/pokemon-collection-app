import { NextRequest, NextResponse } from 'next/server'

// Cache mémoire simple (clé = name+language, valeur = { data, timestamp })
const cache: Record<string, { data: any, timestamp: number }> = {}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || ''
  const language = searchParams.get('language') || ''
  const EBAY_APP_ID = process.env.EBAY_APP_ID
  const cacheKey = `${name}_${language}`

  // 1h de cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 3600_000) {
    return NextResponse.json(cache[cacheKey].data)
  }

  const searchTerm = `${name} ${language}`.trim()
  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.13.0&SECURITY-APPNAME=${EBAY_APP_ID}&RESPONSE-DATA-FORMAT=JSON&keywords=${encodeURIComponent(searchTerm)}&categoryId=2606&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true`
  const res = await fetch(url)
  const data = await res.json()
  console.log('eBay API response:', JSON.stringify(data, null, 2))
  cache[cacheKey] = { data, timestamp: Date.now() }
  return NextResponse.json(data)
} 