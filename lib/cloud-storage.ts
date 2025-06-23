import type { PokemonItem, AppSettings } from "@/types/collection"
import { AuthService, type User } from "./auth-service"

export interface CloudCollection {
  id: string
  userId: string
  name: string
  items: PokemonItem[]
  settings: AppSettings
  isPublic: boolean
  shareCode?: string
  createdAt: string
  updatedAt: string
  lastSync: string
}

export class CloudStorage {
  private static readonly COLLECTIONS_KEY = "pokemon-cloud-collections"
  private static readonly SYNC_KEY = "pokemon-last-sync"

  // Obtenir toutes les collections cloud
  static getCloudCollections(): Record<string, CloudCollection> {
    if (typeof window === "undefined") return {}
    const data = localStorage.getItem(this.COLLECTIONS_KEY)
    return data ? JSON.parse(data) : {}
  }

  // Sauvegarder les collections cloud
  static saveCloudCollections(collections: Record<string, CloudCollection>): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections))
  }

  // Obtenir la collection principale de l'utilisateur
  static getUserCollection(userId: string): CloudCollection | null {
    const collections = this.getCloudCollections()
    return Object.values(collections).find((c) => c.userId === userId && c.name === "Ma Collection") || null
  }

  // Créer une nouvelle collection pour un utilisateur
  static async createUserCollection(user: User): Promise<CloudCollection> {
    const newCollection: CloudCollection = {
      id: user.collections.main,
      userId: user.id,
      name: "Ma Collection",
      items: [],
      settings: { theme: "system", currency: "EUR", defaultStorageLocation: "" },
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
    }

    const collections = this.getCloudCollections()
    collections[newCollection.id] = newCollection
    this.saveCloudCollections(collections)

    return newCollection
  }

  // Synchroniser la collection locale vers le cloud
  static async syncToCloud(items: PokemonItem[], settings: AppSettings): Promise<boolean> {
    const user = AuthService.getCurrentUser()
    if (!user) return false

    try {
      let collection = this.getUserCollection(user.id)

      if (!collection) {
        collection = await this.createUserCollection(user)
      }

      // Mettre à jour la collection
      collection.items = items
      collection.settings = settings
      collection.updatedAt = new Date().toISOString()
      collection.lastSync = new Date().toISOString()

      const collections = this.getCloudCollections()
      collections[collection.id] = collection
      this.saveCloudCollections(collections)

      // Marquer la dernière synchronisation
      localStorage.setItem(this.SYNC_KEY, new Date().toISOString())

      return true
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
      return false
    }
  }

  // Synchroniser depuis le cloud vers local
  static async syncFromCloud(): Promise<{ items: PokemonItem[]; settings: AppSettings } | null> {
    const user = AuthService.getCurrentUser()
    if (!user) return null

    try {
      const collection = this.getUserCollection(user.id)
      if (!collection) return null

      return {
        items: collection.items,
        settings: collection.settings,
      }
    } catch (error) {
      console.error("Erreur de synchronisation depuis le cloud:", error)
      return null
    }
  }

  // Partager une collection
  static async shareCollection(makePublic: boolean): Promise<string | null> {
    const user = AuthService.getCurrentUser()
    if (!user) return null

    try {
      const collection = this.getUserCollection(user.id)
      if (!collection) return null

      collection.isPublic = makePublic
      if (makePublic && !collection.shareCode) {
        collection.shareCode = AuthService.generateShareCode(collection.id)
      }
      collection.updatedAt = new Date().toISOString()

      const collections = this.getCloudCollections()
      collections[collection.id] = collection
      this.saveCloudCollections(collections)

      return collection.shareCode || null
    } catch (error) {
      console.error("Erreur de partage:", error)
      return null
    }
  }

  // Accéder à une collection partagée
  static getSharedCollection(shareCode: string): CloudCollection | null {
    const collections = this.getCloudCollections()
    return Object.values(collections).find((c) => c.shareCode === shareCode && c.isPublic) || null
  }

  // Obtenir la dernière synchronisation
  static getLastSyncTime(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.SYNC_KEY)
  }

  // Vérifier si une synchronisation est nécessaire
  static needsSync(): boolean {
    const lastSync = this.getLastSyncTime()
    if (!lastSync) return true

    const lastSyncTime = new Date(lastSync).getTime()
    const now = new Date().getTime()
    const fiveMinutes = 5 * 60 * 1000

    return now - lastSyncTime > fiveMinutes
  }

  // Obtenir les statistiques de synchronisation
  static getSyncStats(): { lastSync: string | null; needsSync: boolean; isOnline: boolean } {
    return {
      lastSync: this.getLastSyncTime(),
      needsSync: this.needsSync(),
      isOnline: navigator.onLine,
    }
  }
}
