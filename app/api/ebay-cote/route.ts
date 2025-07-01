import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || ''
  const language = searchParams.get('language') || ''
  const EBAY_APP_ID = process.env.EBAY_APP_ID

  const searchTerm = `${name} ${language}`.trim()
  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.13.0&SECURITY-APPNAME=${EBAY_APP_ID}&RESPONSE-DATA-FORMAT=JSON&keywords=${encodeURIComponent(searchTerm)}&categoryId=2606&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true`
  const res = await fetch(url)
  const data = await res.json()
  console.log('eBay API response:', JSON.stringify(data, null, 2))
  return NextResponse.json(data)
} 