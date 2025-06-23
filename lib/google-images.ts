const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'AIzaSyChoj62oZflmlhELnjZJbikh1LKKust0wo'
const SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID || 'd1b3420711c724311'

export class GoogleImagesService {
  // Simuler une recherche d'images Google
  static async searchImages(query: string): Promise<string[]> {
    // Simuler un délai de recherche
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Base d'images simulées pour les produits Pokémon
    const imageDatabase: Record<string, string[]> = {
      charizard: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
      ],
      pikachu: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
      ],
      booster: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
      ],
      coffret: [
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      ],
      tin: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
      ],
      deck: [
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
      ],
      protege: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      ],
    }

    // Nettoyer la requête
    const cleanQuery = query
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")

    // Chercher des mots-clés dans la requête
    for (const [keyword, images] of Object.entries(imageDatabase)) {
      if (cleanQuery.includes(keyword)) {
        return images
      }
    }

    // Images par défaut si aucun mot-clé trouvé
    return [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400",
    ]
  }

  // Obtenir la meilleure image pour un produit
  static async getBestImage(productName: string): Promise<string> {
    const images = await this.searchImages(productName)
    return images[0] || "/placeholder.svg?height=300&width=400"
  }

  // Générer une URL d'image basée sur le nom du produit
  static generateImageUrl(productName: string): string {
    // Créer une URL d'image basée sur le hash du nom
    const hash = productName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const imageId = (Math.abs(hash) % 1000) + 100 // Entre 100 et 1099
    return `https://picsum.photos/400/300?random=${imageId}`
  }

  static async searchImage(searchTerm: string): Promise<string | null> {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchTerm)}&searchType=image&num=1`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        return data.items[0].link
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors de la recherche d\'image Google:', error)
      return null
    }
  }

  static async getProductImage(productName: string, language: string = 'francais'): Promise<string | null> {
    // Construire un terme de recherche optimisé pour les produits Pokémon
    const searchTerm = `${productName} pokemon ${language}`
    
    try {
      const imageUrl = await this.searchImage(searchTerm)
      return imageUrl
    } catch (error) {
      console.error('Erreur lors de la récupération d\'image produit:', error)
      return null
    }
  }
}
