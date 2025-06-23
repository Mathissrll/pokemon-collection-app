import type { PokemonItem } from "@/types/collection"

export class CardMarketLinks {
  private static readonly BASE_URL = "https://www.cardmarket.com/fr/Pokemon"

  // Mapping des noms français vers les URLs CardMarket
  private static readonly FRENCH_PRODUCTS: Record<string, string> = {
    // Produits scellés récents
    "Coffret Dresseur d'Élite Écarlate et Violet": "/Products/Singles/Scarlet-Violet-Base-Set/Elite-Trainer-Box",
    "Booster Box Écarlate et Violet": "/Products/Booster-Boxes/Scarlet-Violet-Base-Set",
    "Display Écarlate et Violet": "/Products/Displays/Scarlet-Violet-Base-Set",
    "Booster Écarlate et Violet": "/Products/Booster-Packs/Scarlet-Violet-Base-Set",

    "Coffret Dresseur d'Élite Paradoxe Temporel": "/Products/Singles/Temporal-Forces/Elite-Trainer-Box",
    "Booster Box Paradoxe Temporel": "/Products/Booster-Boxes/Temporal-Forces",
    "Booster Paradoxe Temporel": "/Products/Booster-Packs/Temporal-Forces",

    "Coffret Dresseur d'Élite Destinées Paldéennes": "/Products/Singles/Paldean-Fates/Elite-Trainer-Box",
    "Booster Box Destinées Paldéennes": "/Products/Booster-Boxes/Paldean-Fates",

    "Coffret Dresseur d'Élite Évolutions Prismatiques": "/Products/Singles/Prismatic-Evolutions/Elite-Trainer-Box",
    "Booster Box Évolutions Prismatiques": "/Products/Booster-Boxes/Prismatic-Evolutions",

    // Collections spéciales
    "Collection Premium Charizard ex": "/Products/Sealed-Products/Charizard-ex-Premium-Collection",
    "Collection Premium Pikachu": "/Products/Sealed-Products/Pikachu-Premium-Collection",
    "Tin Koraidon ex": "/Products/Tins/Koraidon-ex-Tin",
    "Tin Miraidon ex": "/Products/Tins/Miraidon-ex-Tin",
    "Tin Charizard ex": "/Products/Tins/Charizard-ex-Tin",

    // Decks préconstruits
    "Deck de Combat Koraidon ex": "/Products/Theme-Decks/Koraidon-ex-Battle-Deck",
    "Deck de Combat Miraidon ex": "/Products/Theme-Decks/Miraidon-ex-Battle-Deck",
    "Deck Préconstruit Pikachu": "/Products/Theme-Decks/Pikachu-Theme-Deck",

    // Accessoires
    "Protège-Cartes Pikachu": "/Products/Accessories/Pikachu-Card-Sleeves",
    "Protège-Cartes Charizard": "/Products/Accessories/Charizard-Card-Sleeves",
    "Tapis de Jeu Pokémon": "/Products/Accessories/Pokemon-Playmat",
    "Deck Box Pokémon": "/Products/Accessories/Pokemon-Deck-Box",
    "Classeur Pokémon": "/Products/Accessories/Pokemon-Binder",

    // Cartes individuelles populaires
    "Charizard ex Alt Art": "/Products/Singles/Scarlet-Violet-Base-Set/Charizard-ex-Special-Illustration-Rare",
    "Pikachu ex": "/Products/Singles/Scarlet-Violet-Base-Set/Pikachu-ex",
    "Koraidon ex": "/Products/Singles/Scarlet-Violet-Base-Set/Koraidon-ex",
    "Miraidon ex": "/Products/Singles/Scarlet-Violet-Base-Set/Miraidon-ex",
  }

  // Générer une URL CardMarket basée sur le nom français
  static generateUrl(item: PokemonItem): string {
    if (item.cardMarketUrl) {
      return item.cardMarketUrl
    }

    // Chercher d'abord dans les produits français connus
    const knownProduct = this.FRENCH_PRODUCTS[item.name]
    if (knownProduct) {
      return `${this.BASE_URL}${knownProduct}`
    }

    // Nettoyer le nom pour l'URL
    const cleanName = item.name
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Construire l'URL selon le type
    switch (item.type) {
      case "single-card":
      case "promo-card":
        return `${this.BASE_URL}/Products/Singles?searchString=${encodeURIComponent(item.name)}`

      case "booster-pack":
        return `${this.BASE_URL}/Products/Booster-Packs?searchString=${encodeURIComponent(item.name)}`

      case "booster-box":
        return `${this.BASE_URL}/Products/Booster-Boxes?searchString=${encodeURIComponent(item.name)}`

      case "etb":
      case "coffret":
      case "collection-box":
      case "premium-collection":
        return `${this.BASE_URL}/Products/Sealed-Products?searchString=${encodeURIComponent(item.name)}`

      case "deck-preconstruit":
      case "battle-deck":
      case "theme-deck":
      case "starter-deck":
        return `${this.BASE_URL}/Products/Theme-Decks?searchString=${encodeURIComponent(item.name)}`

      case "tin":
        return `${this.BASE_URL}/Products/Tins?searchString=${encodeURIComponent(item.name)}`

      case "accessoire":
      case "sleeves":
      case "playmat":
      case "deckbox":
      case "binder":
        return `${this.BASE_URL}/Products/Accessories?searchString=${encodeURIComponent(item.name)}`

      default:
        return `${this.BASE_URL}/Products?searchString=${encodeURIComponent(item.name)}`
    }
  }

  // Générer une URL de recherche CardMarket
  static generateSearchUrl(searchTerm: string): string {
    return `${this.BASE_URL}/Products?searchString=${encodeURIComponent(searchTerm)}`
  }

  // Vérifier si un lien CardMarket est valide
  static isValidCardMarketUrl(url: string): boolean {
    return url.includes("cardmarket.com") && url.includes("Pokemon")
  }

  // Extraire l'ID CardMarket depuis une URL
  static extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/(\d+)(?:\?|$)/)
    return match ? match[1] : null
  }

  // Obtenir des suggestions de noms français
  static getFrenchSuggestions(partialName: string): string[] {
    const suggestions = Object.keys(this.FRENCH_PRODUCTS)
      .filter((name) => name.toLowerCase().includes(partialName.toLowerCase()))
      .slice(0, 5)

    return suggestions
  }
}
