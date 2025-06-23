// Service pour récupérer les cotes basées sur les dernières ventes eBay
export interface EbaySale {
  title: string
  price: number
  currency: string
  condition: string
  soldDate: string
  shipping: number
  location: string
  seller: {
    name: string
    feedback: number
    feedbackPercentage: number
  }
}

export interface EbayPriceData {
  productName: string
  averagePrice: number
  medianPrice: number
  lowestPrice: number
  highestPrice: number
  totalSales: number
  recentSales: EbaySale[]
  lastUpdated: string
  trend: "up" | "down" | "stable"
  confidence: "high" | "medium" | "low"
}

// Simulation des données eBay (en réalité, cela viendrait de l'API eBay)
const EBAY_MOCK_DATA: Record<string, EbayPriceData> = {
  "booster écarlate et violet": {
    productName: "Booster Pokémon Écarlate et Violet",
    averagePrice: 4.25,
    medianPrice: 4.2,
    lowestPrice: 3.8,
    highestPrice: 4.9,
    totalSales: 847,
    recentSales: [
      {
        title: "Booster Pokémon Écarlate et Violet - Neuf",
        price: 4.2,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-15",
        shipping: 0,
        location: "France",
        seller: { name: "pokemon_france", feedback: 2847, feedbackPercentage: 99.2 },
      },
      {
        title: "Pokémon SV Booster Pack - Mint",
        price: 4.1,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-14",
        shipping: 1.5,
        location: "France",
        seller: { name: "cartes_collector", feedback: 1523, feedbackPercentage: 98.8 },
      },
      {
        title: "Booster Écarlate Violet Français",
        price: 4.35,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-14",
        shipping: 0,
        location: "France",
        seller: { name: "tcg_master", feedback: 3421, feedbackPercentage: 99.5 },
      },
    ],
    lastUpdated: "2024-01-15T10:30:00Z",
    trend: "stable",
    confidence: "high",
  },

  "etb écarlate et violet": {
    productName: "ETB Pokémon Écarlate et Violet",
    averagePrice: 43.5,
    medianPrice: 42.9,
    lowestPrice: 39.99,
    highestPrice: 47.5,
    totalSales: 234,
    recentSales: [
      {
        title: "Elite Trainer Box Écarlate et Violet - Scellée",
        price: 42.9,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-15",
        shipping: 0,
        location: "France",
        seller: { name: "pokemon_store_fr", feedback: 4521, feedbackPercentage: 99.7 },
      },
      {
        title: "ETB Pokémon SV - Française",
        price: 41.5,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-14",
        shipping: 3.9,
        location: "France",
        seller: { name: "collection_pokemon", feedback: 1876, feedbackPercentage: 98.9 },
      },
    ],
    lastUpdated: "2024-01-15T11:15:00Z",
    trend: "stable",
    confidence: "high",
  },

  "etb obsidienne": {
    productName: "ETB Pokémon Obsidienne",
    averagePrice: 52.8,
    medianPrice: 51.9,
    lowestPrice: 48.0,
    highestPrice: 59.9,
    totalSales: 156,
    recentSales: [
      {
        title: "Elite Trainer Box Obsidienne - Neuve Scellée",
        price: 51.9,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-15",
        shipping: 0,
        location: "France",
        seller: { name: "pokemon_premium", feedback: 3247, feedbackPercentage: 99.4 },
      },
      {
        title: "ETB Obsidienne Française - Mint",
        price: 53.5,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-13",
        shipping: 4.5,
        location: "France",
        seller: { name: "tcg_france", feedback: 2156, feedbackPercentage: 99.1 },
      },
    ],
    lastUpdated: "2024-01-15T09:45:00Z",
    trend: "up",
    confidence: "high",
  },

  "collection charizard ex": {
    productName: "Collection Charizard ex",
    averagePrice: 26.4,
    medianPrice: 25.9,
    lowestPrice: 22.5,
    highestPrice: 31.9,
    totalSales: 89,
    recentSales: [
      {
        title: "Collection Charizard ex - Scellée FR",
        price: 25.9,
        currency: "EUR",
        condition: "Neuf",
        soldDate: "2024-01-14",
        shipping: 0,
        location: "France",
        seller: { name: "charizard_collector", feedback: 1847, feedbackPercentage: 99.3 },
      },
    ],
    lastUpdated: "2024-01-15T08:20:00Z",
    trend: "up",
    confidence: "medium",
  },
}

export class EbayPriceService {
  // Simule la recherche sur eBay
  static async searchProduct(productName: string, productType: string): Promise<EbayPriceData | null> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const searchKey = `${productType} ${productName}`.toLowerCase()

    // Recherche dans les données mockées
    for (const [key, data] of Object.entries(EBAY_MOCK_DATA)) {
      if (searchKey.includes(key) || key.includes(productName.toLowerCase())) {
        return data
      }
    }

    // Si aucune correspondance, retourner des données génériques
    return this.generateGenericData(productName, productType)
  }

  // Génère des données génériques basées sur le type
  private static generateGenericData(productName: string, productType: string): EbayPriceData {
    const basePrice = this.getBasePriceByType(productType)
    const variation = 0.15 // ±15% de variation

    return {
      productName,
      averagePrice: basePrice,
      medianPrice: basePrice * 0.95,
      lowestPrice: basePrice * (1 - variation),
      highestPrice: basePrice * (1 + variation),
      totalSales: Math.floor(Math.random() * 200) + 50,
      recentSales: [
        {
          title: `${productName} - Neuf`,
          price: basePrice * 0.98,
          currency: "EUR",
          condition: "Neuf",
          soldDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          shipping: Math.random() > 0.5 ? 0 : 2.9,
          location: "France",
          seller: {
            name: "pokemon_seller",
            feedback: Math.floor(Math.random() * 3000) + 500,
            feedbackPercentage: 98 + Math.random() * 2,
          },
        },
      ],
      lastUpdated: new Date().toISOString(),
      trend: Math.random() > 0.6 ? "up" : Math.random() > 0.3 ? "stable" : "down",
      confidence: "low",
    }
  }

  private static getBasePriceByType(type: string): number {
    const prices: Record<string, number> = {
      booster: 4.2,
      etb: 42.0,
      collection: 24.0,
      tin: 16.0,
      deck: 11.5,
      autre: 15.0,
    }

    return prices[type.toLowerCase()] || 12.0
  }

  // Formate les données pour l'affichage
  static formatPriceData(data: EbayPriceData): {
    estimatedPrice: number
    confidence: "high" | "medium" | "low"
    source: string
    trend: string
    details: string
  } {
    const trendText = data.trend === "up" ? "📈 En hausse" : data.trend === "down" ? "📉 En baisse" : "➡️ Stable"

    return {
      estimatedPrice: data.averagePrice,
      confidence: data.confidence,
      source: `eBay (${data.totalSales} ventes)`,
      trend: trendText,
      details: `Médiane: ${data.medianPrice.toFixed(2)}€ | Range: ${data.lowestPrice.toFixed(2)}€ - ${data.highestPrice.toFixed(2)}€`,
    }
  }
}
