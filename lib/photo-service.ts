import type { PokemonItem } from "@/types/collection"

export class PhotoService {
  // Service pour générer des photos automatiques
  private static readonly UNSPLASH_BASE = "https://source.unsplash.com"
  private static readonly PLACEHOLDER_BASE = "https://via.placeholder.com"

  // Mots-clés pour améliorer la recherche d'images
  private static getSearchKeywords(item: PokemonItem): string[] {
    const keywords = ["pokemon"]

    // Ajouter des mots-clés basés sur le type
    switch (item.type) {
      case "single-card":
      case "promo-card":
        keywords.push("card", "trading card")
        break
      case "booster-pack":
        keywords.push("booster pack", "cards")
        break
      case "booster-box":
        keywords.push("booster box", "sealed")
        break
      case "etb":
        keywords.push("elite trainer box", "etb")
        break
      case "coffret":
        keywords.push("collection box", "set")
        break
      case "tin":
        keywords.push("tin box", "metal box")
        break
      case "sleeves":
        keywords.push("card sleeves", "protectors")
        break
      case "playmat":
        keywords.push("playmat", "game mat")
        break
      case "deckbox":
        keywords.push("deck box", "storage")
        break
      default:
        keywords.push("collectible")
    }

    // Extraire des mots du nom du produit
    const nameWords = item.name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((word) => word.length > 2)
      .slice(0, 3) // Prendre les 3 premiers mots significatifs

    keywords.push(...nameWords)

    return keywords
  }

  // Générer une URL d'image via Unsplash
  static generateUnsplashUrl(item: PokemonItem, width = 400, height = 300): string {
    const keywords = this.getSearchKeywords(item)
    const query = keywords.join(",")
    return `${this.UNSPLASH_BASE}/${width}x${height}/?${encodeURIComponent(query)}`
  }

  // Générer une URL d'image placeholder avec texte
  static generatePlaceholderUrl(item: PokemonItem, width = 400, height = 300): string {
    const text = encodeURIComponent(item.name.slice(0, 20))
    return `${this.PLACEHOLDER_BASE}/${width}x${height}/4F46E5/FFFFFF?text=${text}`
  }

  // Générer plusieurs options d'images
  static generateImageOptions(item: PokemonItem): Array<{ url: string; source: string; description: string }> {
    return [
      {
        url: this.generateUnsplashUrl(item),
        source: "Unsplash",
        description: "Photo réelle du produit",
      },
      {
        url: this.generateUnsplashUrl(item, 500, 400),
        source: "Unsplash (HD)",
        description: "Photo haute définition",
      },
      {
        url: this.generatePlaceholderUrl(item),
        source: "Placeholder",
        description: "Image de substitution",
      },
      {
        url: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
        source: "Lorem Picsum",
        description: "Image aléatoire",
      },
    ]
  }

  // Obtenir la meilleure image automatiquement
  static async getAutoImage(item: PokemonItem): Promise<string> {
    // Simuler une recherche d'image intelligente
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Retourner une URL Unsplash optimisée
    return this.generateUnsplashUrl(item)
  }

  // Vérifier si une URL d'image est valide
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok && response.headers.get("content-type")?.startsWith("image/") === true
    } catch {
      return false
    }
  }

  // Obtenir une image de fallback
  static getFallbackImage(item: PokemonItem): string {
    return `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(item.name.slice(0, 15))}`
  }
}
