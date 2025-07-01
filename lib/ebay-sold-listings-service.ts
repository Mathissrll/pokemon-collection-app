const EBAY_APP_ID = process.env.EBAY_APP_ID

// Service pour rechercher les ventes réussies eBay avec terme exact
export interface EbaySoldListing {
  title: string
  soldPrice: number
  soldDate: string
  condition: string
  shipping: number
  location: string
  seller: {
    name: string
    feedback: number
    feedbackPercentage: number
  }
  imageUrl?: string
  listingUrl: string
}

export interface EbaySoldData {
  searchTerm: string
  lastThreeSales: EbaySoldListing[] // LES 3 DERNIÈRES VENTES
  totalSoldListings: number
  searchUrl: string
  lastUpdated: string
}

export class EbaySoldListingsService {
  // Construit l'URL eBay avec filtres pour ventes réussies
  static buildEbaySearchUrl(searchTerm: string): string {
    const encodedTerm = encodeURIComponent(searchTerm)
    return `https://www.ebay.fr/sch/i.html?_nkw=${encodedTerm}&_sacat=0&LH_Sold=1&LH_Complete=1&_sop=13`
    // _nkw = terme de recherche
    // _sacat=0 = toutes catégories
    // LH_Sold=1 = ventes terminées
    // LH_Complete=1 = ventes réussies seulement
    // _sop=13 = tri par date (plus récent d'abord)
  }

  // Simule l'extraction des 3 DERNIÈRES ventes eBay
  static async searchSoldListings(searchTerm: string): Promise<EbaySoldData> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const searchUrl = this.buildEbaySearchUrl(searchTerm)

    // Simulation des données de ventes réussies basées sur le terme exact
    const mockSoldListings = this.generateMockSoldListings(searchTerm)

    // LES 3 DERNIÈRES VENTES (les plus récentes)
    const lastThreeSales = mockSoldListings.slice(0, 3)

    return {
      searchTerm,
      lastThreeSales, // LES 3 DERNIÈRES VENTES POUR CHOISIR
      totalSoldListings: mockSoldListings.length,
      searchUrl,
      lastUpdated: new Date().toISOString(),
    }
  }

  // Génère des ventes simulées basées sur le terme exact
  private static generateMockSoldListings(searchTerm: string): EbaySoldListing[] {
    const basePrice = this.estimateBasePrice(searchTerm)
    const listings: EbaySoldListing[] = []

    // Génère 15-25 ventes simulées
    const numListings = Math.floor(Math.random() * 11) + 15

    for (let i = 0; i < numListings; i++) {
      // Variation de prix réaliste
      const variation = (Math.random() - 0.5) * 0.3 // ±15% de variation
      const soldPrice = Math.max(0.5, basePrice * (1 + variation))

      // Les 3 premières ventes sont très récentes (0-7 jours)
      const daysAgo = i < 3 ? Math.floor(Math.random() * 8) : Math.floor(Math.random() * 25) + 7
      const soldDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      listings.push({
        title: this.generateRealisticTitle(searchTerm, i),
        soldPrice: Math.round(soldPrice * 100) / 100,
        soldDate: soldDate.toISOString().split("T")[0],
        condition: this.getRandomCondition(),
        shipping: Math.random() > 0.6 ? 0 : Math.round((Math.random() * 5 + 1) * 100) / 100,
        location: this.getRandomLocation(),
        seller: {
          name: this.generateSellerName(),
          feedback: Math.floor(Math.random() * 3000) + 200,
          feedbackPercentage: Math.round((98.5 + Math.random() * 1.5) * 10) / 10,
        },
        imageUrl: `/placeholder.svg?height=80&width=80`,
        listingUrl: `https://www.ebay.fr/itm/123456789${i}`,
      })
    }

    // Trie par date (plus récent d'abord)
    return listings.sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime())
  }

  // Estime un prix de base selon le terme de recherche
  private static estimateBasePrice(searchTerm: string): number {
    const term = searchTerm.toLowerCase()

    // Prix basés sur des mots-clés réalistes
    if (term.includes("booster") && !term.includes("box")) return 4.25
    if (term.includes("etb") || term.includes("elite trainer")) return 44.9
    if (term.includes("booster box") || term.includes("display")) return 118.5
    if (term.includes("collection") && !term.includes("box")) return 24.9
    if (term.includes("tin")) return 15.9
    if (term.includes("deck")) return 11.9
    if (term.includes("charizard")) return 34.5
    if (term.includes("pikachu")) return 18.2
    if (term.includes("base set")) return 780
    if (term.includes("1st edition") || term.includes("1ère édition")) return 190

    // Prix par défaut
    return 15.5
  }

  // Génère un titre réaliste basé sur le terme de recherche
  private static generateRealisticTitle(searchTerm: string, index: number): string {
    const variations = [
      `${searchTerm} - Neuf Scellé`,
      `${searchTerm} Français`,
      `${searchTerm} - Mint`,
      `${searchTerm} TCG`,
      `${searchTerm} - Collection`,
      `${searchTerm} Authentique`,
      `${searchTerm} - Rare`,
      `${searchTerm} Scellé`,
    ]

    return variations[index % variations.length]
  }

  private static getRandomCondition(): string {
    const conditions = ["Neuf", "Comme neuf", "Très bon état", "Bon état"]
    return conditions[Math.floor(Math.random() * conditions.length)]
  }

  private static getRandomLocation(): string {
    const locations = ["France", "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  private static generateSellerName(): string {
    const prefixes = ["pokemon", "tcg", "cartes", "collection", "vintage"]
    const suffixes = ["france", "pro", "store", "collector", "expert"]
    const numbers = Math.floor(Math.random() * 999)

    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }${numbers}`
  }
}

// Fonction utilitaire pour récupérer la médiane des prix de vente eBay pour un item donné
export async function getMedianSoldPriceForItem(name: string, language: string): Promise<{ median: number, listings: EbaySoldListing[] }> {
  // Appel à l'API interne Next.js
  const res = await fetch(`/api/ebay-cote?name=${encodeURIComponent(name)}&language=${encodeURIComponent(language)}`)
  const data = await res.json()
  const items = data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || []
  const listings: EbaySoldListing[] = items.map((item: any) => ({
    title: item.title?.[0] || '',
    soldPrice: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0'),
    soldDate: item.listingInfo?.[0]?.endTime?.[0]?.split('T')[0] || '',
    condition: item.condition?.[0]?.conditionDisplayName?.[0] || '',
    shipping: parseFloat(item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ || '0'),
    location: item.location?.[0] || '',
    seller: {
      name: item.sellerInfo?.[0]?.sellerUserName?.[0] || '',
      feedback: parseInt(item.sellerInfo?.[0]?.feedbackScore?.[0] || '0'),
      feedbackPercentage: parseFloat(item.sellerInfo?.[0]?.positiveFeedbackPercent?.[0] || '0'),
    },
    imageUrl: item.galleryURL?.[0] || '',
    listingUrl: item.viewItemURL?.[0] || '',
  }))
  if (!listings.length) return { median: 0, listings: [] }
  const prices = listings.map(l => l.soldPrice).sort((a, b) => a - b)
  const mid = Math.floor(prices.length / 2)
  const median = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2
  return { median, listings }
}
