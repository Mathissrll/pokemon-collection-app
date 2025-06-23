// Base de données des cotes de référence pour les produits Pokémon (cotes réalistes 2024)
export interface PriceReference {
  name: string
  type: string
  basePrice: number
  currentTrend: number // Multiplicateur de tendance (1.0 = stable, 1.2 = +20%, 0.8 = -20%)
  rarity: "common" | "uncommon" | "rare" | "ultra-rare" | "secret"
  lastUpdate: string
}

export const PRICE_DATABASE: PriceReference[] = [
  // Boosters récents (cotes réalistes)
  {
    name: "Booster Écarlate et Violet",
    type: "booster",
    basePrice: 4.2,
    currentTrend: 1.0,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "Booster Paradoxe Temporel",
    type: "booster",
    basePrice: 4.5,
    currentTrend: 1.05,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "Booster Obsidienne",
    type: "booster",
    basePrice: 4.8,
    currentTrend: 1.1,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },
  {
    name: "Booster Destinées Paldéennes",
    type: "booster",
    basePrice: 4.3,
    currentTrend: 1.0,
    rarity: "common",
    lastUpdate: "2024-01",
  },

  // ETB (Elite Trainer Box) - cotes réalistes
  {
    name: "ETB Écarlate et Violet",
    type: "etb",
    basePrice: 42,
    currentTrend: 1.0,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "ETB Paradoxe Temporel",
    type: "etb",
    basePrice: 45,
    currentTrend: 1.08,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },
  {
    name: "ETB Obsidienne",
    type: "etb",
    basePrice: 48,
    currentTrend: 1.12,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },
  {
    name: "ETB Destinées Paldéennes",
    type: "etb",
    basePrice: 43,
    currentTrend: 1.05,
    rarity: "common",
    lastUpdate: "2024-01",
  },

  // Collections spéciales - cotes réalistes
  {
    name: "Collection Charizard ex",
    type: "collection",
    basePrice: 22,
    currentTrend: 1.15,
    rarity: "rare",
    lastUpdate: "2024-01",
  },
  {
    name: "Collection Pikachu VMAX",
    type: "collection",
    basePrice: 18,
    currentTrend: 1.1,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },
  {
    name: "Collection Mewtwo VStar",
    type: "collection",
    basePrice: 24,
    currentTrend: 1.2,
    rarity: "rare",
    lastUpdate: "2024-01",
  },

  // Tins - cotes réalistes
  {
    name: "Tin Charizard",
    type: "tin",
    basePrice: 16,
    currentTrend: 1.1,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },
  {
    name: "Tin Pikachu",
    type: "tin",
    basePrice: 14,
    currentTrend: 1.05,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "Tin Mewtwo",
    type: "tin",
    basePrice: 17,
    currentTrend: 1.12,
    rarity: "uncommon",
    lastUpdate: "2024-01",
  },

  // Decks - cotes réalistes
  {
    name: "Deck Charizard ex",
    type: "deck",
    basePrice: 11,
    currentTrend: 1.0,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "Deck Miraidon ex",
    type: "deck",
    basePrice: 12,
    currentTrend: 1.02,
    rarity: "common",
    lastUpdate: "2024-01",
  },
  {
    name: "Deck Koraidon ex",
    type: "deck",
    basePrice: 12,
    currentTrend: 1.02,
    rarity: "common",
    lastUpdate: "2024-01",
  },

  // Produits vintage (cotes réalistes mais élevées)
  {
    name: "Booster Base Set",
    type: "booster",
    basePrice: 380,
    currentTrend: 1.2,
    rarity: "ultra-rare",
    lastUpdate: "2024-01",
  },
  {
    name: "Booster Jungle",
    type: "booster",
    basePrice: 220,
    currentTrend: 1.15,
    rarity: "ultra-rare",
    lastUpdate: "2024-01",
  },
  {
    name: "Booster Fossile",
    type: "booster",
    basePrice: 250,
    currentTrend: 1.18,
    rarity: "ultra-rare",
    lastUpdate: "2024-01",
  },
  {
    name: "ETB Célébrations",
    type: "etb",
    basePrice: 75,
    currentTrend: 1.25,
    rarity: "rare",
    lastUpdate: "2024-01",
  },
]

export class PriceEstimator {
  // Recherche une cote par nom de produit
  static findPrice(productName: string, productType: string): PriceReference | null {
    const normalizedName = productName.toLowerCase()
    const normalizedType = productType.toLowerCase()

    // Recherche exacte d'abord
    let match = PRICE_DATABASE.find(
      (item) => item.name.toLowerCase().includes(normalizedName) && item.type.toLowerCase() === normalizedType,
    )

    if (match) return match

    // Recherche par mots-clés
    const keywords = normalizedName.split(" ")
    match = PRICE_DATABASE.find((item) => {
      const itemName = item.name.toLowerCase()
      return (
        keywords.some((keyword) => keyword.length > 2 && itemName.includes(keyword)) &&
        item.type.toLowerCase() === normalizedType
      )
    })

    return match
  }

  // Estime un prix basé sur le type si aucune correspondance exacte
  static estimateByType(productType: string): number {
    const typeAverages: Record<string, number> = {
      booster: 4.5,
      etb: 42,
      collection: 20,
      tin: 15,
      deck: 11,
      autre: 12,
    }

    return typeAverages[productType.toLowerCase()] || 10
  }

  // Calcule le prix final avec tendance
  static calculateCurrentPrice(basePrice: number, trend: number): number {
    return Math.round(basePrice * trend * 100) / 100
  }

  // Obtient une estimation complète
  static getEstimate(
    productName: string,
    productType: string,
  ): {
    estimatedPrice: number
    confidence: "high" | "medium" | "low"
    source: "database" | "type-average"
    trend: string
    rarity?: string
  } {
    const match = this.findPrice(productName, productType)

    if (match) {
      const currentPrice = this.calculateCurrentPrice(match.basePrice, match.currentTrend)
      const trendText =
        match.currentTrend > 1.08 ? "📈 En hausse" : match.currentTrend < 0.95 ? "📉 En baisse" : "➡️ Stable"

      return {
        estimatedPrice: currentPrice,
        confidence: "high",
        source: "database",
        trend: trendText,
        rarity: match.rarity,
      }
    }

    // Estimation basée sur le type
    const typePrice = this.estimateByType(productType)
    return {
      estimatedPrice: typePrice,
      confidence: "low",
      source: "type-average",
      trend: "➡️ Estimation générale",
    }
  }
}
