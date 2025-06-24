export interface PokemonItem {
  id: string
  name: string
  type:
    | "coffret"
    | "etb"
    | "booster-box"
    | "display"
    | "booster-pack"
    | "single-card"
    | "promo-card"
    | "deck-preconstruit"
    | "tin"
    | "collection-box"
    | "premium-collection"
    | "battle-deck"
    | "theme-deck"
    | "starter-deck"
    | "accessoire"
    | "sleeves"
    | "playmat"
    | "deckbox"
    | "binder"
    | "toploader"
    | "autre"
  language:
    | "francais"
    | "anglais"
    | "japonais"
    | "allemand"
    | "italien"
    | "espagnol"
    | "coreen"
    | "chinois-traditionnel"
    | "chinois-simplifie"
    | "portugais"
    | "russe"
    | "autre"
  barcode?: string
  purchaseDate: string
  purchasePrice: number
  estimatedValue: number
  condition: "neuf" | "excellent" | "bon" | "moyen" | "abime"
  photo?: string
  storageLocation: string
  notes?: string
  // Nouveaux champs pour CardMarket
  cardMarketId?: string
  cardMarketUrl?: string
  isSold: boolean
  saleRecord?: SaleRecord
  cardMarketPrice?: CardMarketPrice
  createdAt: string
  updatedAt: string
  // Champs pour la cote eBay
  coteActuelle?: number
  historiqueCote?: { date: string; valeur: number }[]
  // Champs pour la gestion de la quantité
  quantity?: number // Quantité de cet objet (par défaut 1)
}

export interface SaleRecord {
  id: string
  itemId: string
  saleDate: string
  salePrice: number
  buyer?: string
  platform?: string
  notes?: string
  createdAt: string
}

export interface CardMarketPrice {
  lowPrice: number
  trendPrice: number
  averagePrice: number
  lastUpdated: string
}

export interface CollectionStats {
  totalItems: number
  totalInvested: number
  totalEstimatedValue: number
  profitLoss: number
  profitLossPercentage: number
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  currency: "EUR" | "USD"
  defaultStorageLocation: string
}
