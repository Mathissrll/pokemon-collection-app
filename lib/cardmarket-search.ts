import type { CardMarketPrice } from "@/types/collection"
import { CardMarketDatabase } from "./cardmarket-database"

export interface CardMarketProduct {
  id: string
  name: string
  type: string
  price: CardMarketPrice
  url: string
  image?: string
}

export class CardMarketSearch {
  private static readonly BASE_URL = "https://www.cardmarket.com/fr/Pokemon"

  // Base de données simulée des produits CardMarket français
  private static readonly PRODUCTS_DB: Record<string, CardMarketProduct> = {
    // Recherche par mots-clés
    "charizard ex": {
      id: "cm-001",
      name: "Charizard ex Alt Art",
      type: "single-card",
      price: {
        lowPrice: 85.0,
        trendPrice: 125.0,
        averagePrice: 105.0,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Singles/Scarlet-Violet-Base-Set/Charizard-ex-Special-Illustration-Rare",
    },

    "pikachu ex": {
      id: "cm-002",
      name: "Pikachu ex",
      type: "single-card",
      price: {
        lowPrice: 12.5,
        trendPrice: 18.0,
        averagePrice: 15.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Singles/Scarlet-Violet-Base-Set/Pikachu-ex",
    },

    "booster ecarlate": {
      id: "cm-003",
      name: "Booster Écarlate et Violet",
      type: "booster-pack",
      price: {
        lowPrice: 3.8,
        trendPrice: 4.2,
        averagePrice: 4.0,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Booster-Packs/Scarlet-Violet-Base-Set",
    },

    "booster box ecarlate": {
      id: "cm-004",
      name: "Booster Box Écarlate et Violet",
      type: "booster-box",
      price: {
        lowPrice: 89.99,
        trendPrice: 95.0,
        averagePrice: 92.5,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Booster-Boxes/Scarlet-Violet-Base-Set",
    },

    "etb ecarlate": {
      id: "cm-005",
      name: "Coffret Dresseur d'Élite Écarlate et Violet",
      type: "etb",
      price: {
        lowPrice: 38.99,
        trendPrice: 42.5,
        averagePrice: 40.75,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Sealed-Products/Scarlet-Violet-Elite-Trainer-Box",
    },

    "paradoxe temporel": {
      id: "cm-006",
      name: "Booster Box Paradoxe Temporel",
      type: "booster-box",
      price: {
        lowPrice: 92.99,
        trendPrice: 98.0,
        averagePrice: 95.5,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Booster-Boxes/Temporal-Forces",
    },

    "evolutions prismatiques": {
      id: "cm-007",
      name: "Booster Box Évolutions Prismatiques",
      type: "booster-box",
      price: {
        lowPrice: 98.99,
        trendPrice: 105.0,
        averagePrice: 102.0,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Booster-Boxes/Prismatic-Evolutions",
    },

    "destinees paldeennes": {
      id: "cm-008",
      name: "Coffret Dresseur d'Élite Destinées Paldéennes",
      type: "etb",
      price: {
        lowPrice: 44.99,
        trendPrice: 48.5,
        averagePrice: 46.75,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Sealed-Products/Paldean-Fates-Elite-Trainer-Box",
    },

    "koraidon ex": {
      id: "cm-009",
      name: "Koraidon ex",
      type: "single-card",
      price: {
        lowPrice: 8.5,
        trendPrice: 12.0,
        averagePrice: 10.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Singles/Scarlet-Violet-Base-Set/Koraidon-ex",
    },

    "tin koraidon": {
      id: "cm-010",
      name: "Tin Koraidon ex",
      type: "tin",
      price: {
        lowPrice: 18.99,
        trendPrice: 21.5,
        averagePrice: 20.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Tins/Koraidon-ex-Tin",
    },

    "miraidon ex": {
      id: "cm-011",
      name: "Miraidon ex",
      type: "single-card",
      price: {
        lowPrice: 8.5,
        trendPrice: 12.0,
        averagePrice: 10.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Singles/Scarlet-Violet-Base-Set/Miraidon-ex",
    },

    "collection premium charizard": {
      id: "cm-012",
      name: "Collection Premium Charizard ex",
      type: "premium-collection",
      price: {
        lowPrice: 65.99,
        trendPrice: 72.5,
        averagePrice: 69.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Sealed-Products/Charizard-ex-Premium-Collection",
    },

    "protege cartes": {
      id: "cm-013",
      name: "Protège-Cartes Pikachu",
      type: "sleeves",
      price: {
        lowPrice: 8.99,
        trendPrice: 11.5,
        averagePrice: 10.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Accessories/Pikachu-Card-Sleeves",
    },

    "deck combat": {
      id: "cm-014",
      name: "Deck de Combat Miraidon ex",
      type: "battle-deck",
      price: {
        lowPrice: 24.99,
        trendPrice: 27.5,
        averagePrice: 26.25,
        lastUpdated: new Date().toISOString(),
      },
      url: "https://www.cardmarket.com/fr/Pokemon/Products/Theme-Decks/Miraidon-ex-Battle-Deck",
    },
  }

  // Rechercher un produit par nom avec l'algorithme amélioré
  static async searchProduct(query: string): Promise<CardMarketProduct[]> {
    // Simuler un délai de recherche
    await new Promise((resolve) => setTimeout(resolve, 600))

    return CardMarketDatabase.searchProducts(query)
  }

  // Obtenir un produit par ID
  static getProductById(id: string): CardMarketProduct | null {
    return CardMarketDatabase.getProductById(id)
  }

  // Obtenir des suggestions de recherche
  static getSuggestions(query: string): string[] {
    return CardMarketDatabase.getSuggestions(query)
  }

  // Recherche instantanée (sans délai) pour l'autocomplétion
  static searchInstant(query: string): CardMarketProduct[] {
    return CardMarketDatabase.searchProducts(query)
  }

  // Obtenir des produits populaires
  static getPopularProducts(): CardMarketProduct[] {
    return CardMarketDatabase.getPopularProducts()
  }

  // Obtenir des produits par type
  static getProductsByType(type: string): CardMarketProduct[] {
    return CardMarketDatabase.getProductsByType(type)
  }
}
