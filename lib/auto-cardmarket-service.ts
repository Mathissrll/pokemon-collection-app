import { CardMarketService } from "./cardmarket-service"
import { GoogleImagesService } from "./google-images"
import type { PokemonProduct } from "./pokemon-products-database"
import type { CardMarketPrice } from "@/types/collection"

export interface AutoProductResult {
  product: PokemonProduct
  cardMarketPrice: CardMarketPrice
  cardMarketUrl: string
  image: string
}

export class AutoCardMarketService {
  // Rechercher automatiquement un produit sur CardMarket
  static async searchProductOnCardMarket(product: PokemonProduct): Promise<AutoProductResult> {
    try {
      // 1. Rechercher le prix sur CardMarket
      const cardMarketPrice = await CardMarketService.fetchPrice(product.name, product.type, product.language)

      // 2. Générer l'URL CardMarket
      const cardMarketUrl = this.generateCardMarketUrl(product)

      // 3. Rechercher une image
      const image = await GoogleImagesService.getBestImage(product.name)

      return {
        product,
        cardMarketPrice,
        cardMarketUrl,
        image,
      }
    } catch (error) {
      console.error("Erreur lors de la recherche CardMarket:", error)

      // Valeurs par défaut en cas d'erreur
      return {
        product,
        cardMarketPrice: {
          lowPrice: product.estimatedPrice ? product.estimatedPrice * 0.9 : 10,
          trendPrice: product.estimatedPrice || 15,
          averagePrice: product.estimatedPrice ? product.estimatedPrice * 1.1 : 20,
          lastUpdated: new Date().toISOString(),
        },
        cardMarketUrl: this.generateCardMarketUrl(product),
        image: GoogleImagesService.generateImageUrl(product.name),
      }
    }
  }

  // Générer une URL CardMarket pour un produit
  private static generateCardMarketUrl(product: PokemonProduct): string {
    const baseUrl = "https://www.cardmarket.com/fr/Pokemon"
    const cleanName = encodeURIComponent(product.name)

    switch (product.type) {
      case "etb":
      case "coffret":
      case "collection-box":
      case "premium-collection":
        return `${baseUrl}/Products/Sealed-Products?searchString=${cleanName}`

      case "booster-box":
      case "display":
        return `${baseUrl}/Products/Booster-Boxes?searchString=${cleanName}`

      case "booster-pack":
        return `${baseUrl}/Products/Booster-Packs?searchString=${cleanName}`

      case "tin":
        return `${baseUrl}/Products/Tins?searchString=${cleanName}`

      case "deck-preconstruit":
      case "battle-deck":
      case "theme-deck":
      case "starter-deck":
        return `${baseUrl}/Products/Theme-Decks?searchString=${cleanName}`

      default:
        return `${baseUrl}/Products?searchString=${cleanName}`
    }
  }

  // Rechercher plusieurs produits en parallèle
  static async searchMultipleProducts(products: PokemonProduct[]): Promise<AutoProductResult[]> {
    const promises = products.map((product) => this.searchProductOnCardMarket(product))

    try {
      return await Promise.all(promises)
    } catch (error) {
      console.error("Erreur lors de la recherche multiple:", error)
      return []
    }
  }

  // Mettre à jour le prix d'un produit existant
  static async updateProductPrice(
    productName: string,
    productType: string,
    language = "francais",
  ): Promise<CardMarketPrice | null> {
    try {
      return await CardMarketService.fetchPrice(productName, productType, language)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du prix:", error)
      return null
    }
  }
}
