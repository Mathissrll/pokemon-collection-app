import type { PokemonItem, AppSettings, SaleRecord, CardMarketPrice } from "@/types/collection"
import { PhotoService } from "./photo-service"
import { CloudStorage } from "./cloud-storage"
import { AuthService } from "./auth-service"
import { GoogleImagesService } from "./google-images"

const STORAGE_KEYS = {
  COLLECTION: "pokemon-collection",
  SETTINGS: "pokemon-settings",
} as const

export class LocalStorage {
  // Obtenir la collection (uniquement pour utilisateur connecté)
  static getCollection(): PokemonItem[] {
    const user = AuthService.getCurrentUser()

    if (!user) {
      // Pas d'utilisateur connecté, retourner un tableau vide
      return []
    }

    // Utilisateur connecté : essayer de récupérer depuis le cloud
    try {
      const cloudCollection = CloudStorage.getUserCollection(user.id)
      if (cloudCollection) {
        return cloudCollection.items
      }
    } catch (error) {
      console.warn("Erreur lors de la récupération cloud, utilisation locale:", error)
    }

    // Fallback vers le stockage local spécifique à l'utilisateur
    if (typeof window === "undefined") return []
    const userKey = `${STORAGE_KEYS.COLLECTION}-${user.id}`
    const data = localStorage.getItem(userKey)
    return data ? JSON.parse(data) : []
  }

  static saveCollection(items: PokemonItem[]): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de sauvegarder : aucun utilisateur connecté")
      return false
    }

    // Sauvegarder localement avec clé spécifique à l'utilisateur
    if (typeof window !== "undefined") {
      const userKey = `${STORAGE_KEYS.COLLECTION}-${user.id}`
      localStorage.setItem(userKey, JSON.stringify(items))
    }

    // Synchroniser avec le cloud
    CloudStorage.syncToCloud(items, this.getSettings()).catch((error) => {
      console.warn("Erreur de synchronisation cloud:", error)
    })

    return true
  }

  // Vérifier les limites du plan utilisateur
  static checkPlanLimits(): { canAddItem: boolean; canAddPhoto: boolean; error?: string } {
    const user = AuthService.getCurrentUser()
    
    if (!user) {
      return { canAddItem: false, canAddPhoto: false, error: "Non connecté" }
    }

    const collection = this.getCollection()
    const isPremium = user.plan === "premium"
    const isAdmin = AuthService.isAdmin()

    // Les admins n'ont pas de limites
    if (isAdmin) {
      return { canAddItem: true, canAddPhoto: true }
    }

    // Vérifier la limite d'objets pour le plan gratuit
    if (!isPremium && collection.length >= 20) {
      return { 
        canAddItem: false, 
        canAddPhoto: false, 
        error: "Limite de 20 objets atteinte. Passez au plan Premium pour ajouter plus d'objets." 
      }
    }

    // Vérifier les photos pour le plan gratuit
    const canAddPhoto = isPremium

    return { canAddItem: true, canAddPhoto }
  }

  static async addItem(item: Omit<PokemonItem, "id" | "createdAt" | "updatedAt">): Promise<PokemonItem | null> {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible d'ajouter un objet : aucun utilisateur connecté")
      return null
    }

    // Vérifier les limites du plan
    const limits = this.checkPlanLimits()
    if (!limits.canAddItem) {
      console.error("Limite du plan atteinte:", limits.error)
      return null
    }

    let photo = item.photo

    // Auto-générer une photo seulement si l'utilisateur peut en avoir
    if (!photo && limits.canAddPhoto) {
      try {
        const googlePhoto = await GoogleImagesService.getProductImage(item.name, item.language)
        if (googlePhoto) {
          photo = googlePhoto
        } else {
          photo = PhotoService.getFallbackImage(item as PokemonItem)
        }
      } catch (error) {
        console.log("Impossible de générer une photo automatique")
        photo = PhotoService.getFallbackImage(item as PokemonItem)
      }
    } else if (!limits.canAddPhoto) {
      // Plan gratuit : pas de photo
      photo = ""
    }

    const collection = this.getCollection()
    // Fusionner si même nom, type, langue, non vendu
    const existingIndex = collection.findIndex(
      (i) =>
        i.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
        i.type === item.type &&
        i.language === item.language &&
        !i.isSold
    )
    if (existingIndex !== -1) {
      // Incrémenter la quantité
      const existing = collection[existingIndex]
      collection[existingIndex] = {
        ...existing,
        quantity: (existing.quantity || 1) + (item.quantity || 1),
        updatedAt: new Date().toISOString(),
      }
      if (this.saveCollection(collection)) {
        return collection[existingIndex]
      }
      return null
    }
    // Sinon, ajouter un nouvel objet
    const newItem: PokemonItem = {
      ...item,
      id: crypto.randomUUID(),
      isSold: false,
      language: item.language || "francais",
      photo: limits.canAddPhoto ? photo : "", // Forcer pas de photo pour le plan gratuit
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: item.quantity || 1,
    }

    collection.push(newItem)
    
    if (this.saveCollection(collection)) {
      return newItem
    }
    
    return null
  }

  static updateItem(id: string, updates: Partial<PokemonItem>): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de modifier un objet : aucun utilisateur connecté")
      return false
    }

    // Vérifier les limites pour les photos
    const limits = this.checkPlanLimits()
    if (updates.photo && !limits.canAddPhoto) {
      console.error("Impossible d'ajouter une photo avec le plan gratuit")
      return false
    }

    const collection = this.getCollection()
    const index = collection.findIndex((item) => item.id === id)
    if (index !== -1) {
      collection[index] = {
        ...collection[index],
        ...updates,
        // Forcer pas de photo pour le plan gratuit
        photo: limits.canAddPhoto ? updates.photo || collection[index].photo : "",
        updatedAt: new Date().toISOString(),
      }
      return this.saveCollection(collection)
    }
    return false
  }

  static deleteItem(id: string): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de supprimer un objet : aucun utilisateur connecté")
      return false
    }

    const collection = this.getCollection()
    const filtered = collection.filter((item) => item.id !== id)
    return this.saveCollection(filtered)
  }

  static getSales(): SaleRecord[] {
    const user = AuthService.getCurrentUser()

    if (!user) {
      return []
    }

    if (typeof window === "undefined") return []
    const userKey = `pokemon-sales-${user.id}`
    const data = localStorage.getItem(userKey)
    return data ? JSON.parse(data) : []
  }

  static saveSales(sales: SaleRecord[]): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de sauvegarder les ventes : aucun utilisateur connecté")
      return false
    }

    if (typeof window === "undefined") return false
    const userKey = `pokemon-sales-${user.id}`
    localStorage.setItem(userKey, JSON.stringify(sales))
    return true
  }

  static sellItem(itemId: string, saleData: Omit<SaleRecord, "id" | "itemId" | "createdAt">): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de vendre un objet : aucun utilisateur connecté")
      return false
    }

    // Créer l'enregistrement de vente
    const saleRecord: SaleRecord = {
      ...saleData,
      id: crypto.randomUUID(),
      itemId,
      createdAt: new Date().toISOString(),
    }

    // Sauvegarder la vente
    const sales = this.getSales()
    sales.push(saleRecord)
    
    if (!this.saveSales(sales)) {
      return false
    }

    // Marquer l'objet comme vendu
    return this.updateItem(itemId, {
      isSold: true,
      saleRecord,
    })
  }

  static getSettings(): AppSettings {
    const user = AuthService.getCurrentUser()

    if (!user) {
      return {
        currency: "EUR",
        theme: "system",
        defaultStorageLocation: "",
      }
    }

    if (typeof window === "undefined") return {
      currency: "EUR",
      theme: "system",
      defaultStorageLocation: "",
    }
    
    const userKey = `${STORAGE_KEYS.SETTINGS}-${user.id}`
    const data = localStorage.getItem(userKey)
    return data ? JSON.parse(data) : {
      currency: "EUR",
      theme: "system",
      defaultStorageLocation: "",
    }
  }

  static saveSettings(settings: AppSettings): boolean {
    const user = AuthService.getCurrentUser()

    if (!user) {
      console.error("Impossible de sauvegarder les paramètres : aucun utilisateur connecté")
      return false
    }

    if (typeof window === "undefined") return false
    const userKey = `${STORAGE_KEYS.SETTINGS}-${user.id}`
    localStorage.setItem(userKey, JSON.stringify(settings))
    return true
  }

  static exportToCSV(items: PokemonItem[]): string {
    const headers = [
      "Nom",
      "Type",
      "Prix d'achat",
      "Valeur estimée",
      "Date d'achat",
      "Localisation",
      "Langue",
      "Statut",
      "Date de création",
    ]

    const rows = items.map((item) => [
      item.name,
      item.type,
      item.purchasePrice.toString(),
      item.estimatedValue.toString(),
      item.purchaseDate,
      item.storageLocation,
      item.language,
      item.isSold ? "Vendu" : "Disponible",
      new Date(item.createdAt).toLocaleDateString("fr-FR"),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    return csvContent
  }

  static async syncWithCloud(): Promise<boolean> {
    const user = AuthService.getCurrentUser()

    if (!user) {
      return false
    }

    try {
      const cloudCollection = await CloudStorage.getUserCollection(user.id)
      if (cloudCollection) {
        const localCollection = this.getCollection()
        // Fusionner les collections (priorité au cloud)
        const merged = [...localCollection, ...cloudCollection.items]
        const unique = merged.filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id)
        )
        this.saveCollection(unique)
        return true
      }
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
    }

    return false
  }

  static isUserLoggedIn(): boolean {
    return AuthService.getCurrentUser() !== null
  }

  static getCurrentUser() {
    return AuthService.getCurrentUser()
  }
}
