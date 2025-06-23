import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PokemonItem, CollectionStats } from "@/types/collection"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStats(items: PokemonItem[]): CollectionStats & {
  totalSold: number
  totalSalesRevenue: number
  realizedProfitLoss: number
} {
  const totalItems = items.length
  const availableItems = items.filter((item) => !item.isSold)
  const soldItems = items.filter((item) => item.isSold)

  const totalInvested = items.reduce((sum, item) => sum + item.purchasePrice, 0)
  const totalEstimatedValue = availableItems.reduce((sum, item) => sum + item.estimatedValue, 0)
  const totalSalesRevenue = soldItems.reduce((sum, item) => sum + (item.saleRecord?.salePrice || 0), 0)

  const profitLoss = totalEstimatedValue - availableItems.reduce((sum, item) => sum + item.purchasePrice, 0)
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0

  const realizedProfitLoss = soldItems.reduce(
    (sum, item) => sum + ((item.saleRecord?.salePrice || 0) - item.purchasePrice),
    0,
  )

  return {
    totalItems,
    totalInvested,
    totalEstimatedValue: totalEstimatedValue + totalSalesRevenue,
    profitLoss,
    profitLossPercentage,
    totalSold: soldItems.length,
    totalSalesRevenue,
    realizedProfitLoss,
  }
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(date))
}

export function getTypeLabel(type: PokemonItem["type"]): string {
  const labels = {
    // Produits scellés principaux
    coffret: "Coffret",
    etb: "Elite Trainer Box",
    "booster-box": "Booster Box",
    display: "Display",
    "booster-pack": "Booster Pack",

    // Cartes individuelles
    "single-card": "Carte Individuelle",
    "promo-card": "Carte Promo",

    // Decks et constructions
    "deck-preconstruit": "Deck Préconstruit",
    "battle-deck": "Battle Deck",
    "theme-deck": "Theme Deck",
    "starter-deck": "Starter Deck",

    // Collections spéciales
    tin: "Tin/Boîte Métal",
    "collection-box": "Collection Box",
    "premium-collection": "Premium Collection",

    // Accessoires
    accessoire: "Accessoire",
    sleeves: "Protège-Cartes",
    playmat: "Tapis de Jeu",
    deckbox: "Deck Box",
    binder: "Classeur",
    toploader: "Toploader",

    autre: "Autre",
  }
  return labels[type]
}

export function getTypeCategory(type: PokemonItem["type"]): string {
  const categories = {
    // Produits scellés
    coffret: "Produits Scellés",
    etb: "Produits Scellés",
    "booster-box": "Produits Scellés",
    display: "Produits Scellés",
    "booster-pack": "Produits Scellés",

    // Cartes
    "single-card": "Cartes",
    "promo-card": "Cartes",

    // Decks
    "deck-preconstruit": "Decks",
    "battle-deck": "Decks",
    "theme-deck": "Decks",
    "starter-deck": "Decks",

    // Collections
    tin: "Collections Spéciales",
    "collection-box": "Collections Spéciales",
    "premium-collection": "Collections Spéciales",

    // Accessoires
    accessoire: "Accessoires",
    sleeves: "Accessoires",
    playmat: "Accessoires",
    deckbox: "Accessoires",
    binder: "Accessoires",
    toploader: "Accessoires",

    autre: "Autre",
  }
  return categories[type]
}
export function getConditionLabel(condition: PokemonItem["condition"]): string {
  const labels = {
    neuf: "Neuf",
    excellent: "Excellent",
    bon: "Bon",
    moyen: "Moyen",
    abime: "Abîmé",
  }
  return labels[condition]
}

export function calculateLanguageStats(
  items: PokemonItem[],
): Record<string, { count: number; value: number; averagePrice: number }> {
  const languageData: Record<string, { count: number; value: number; totalInvested: number }> = {}

  items.forEach((item) => {
    if (!languageData[item.language]) {
      languageData[item.language] = { count: 0, value: 0, totalInvested: 0 }
    }
    languageData[item.language].count++
    languageData[item.language].value += item.estimatedValue
    languageData[item.language].totalInvested += item.purchasePrice
  })

  // Convertir en format final avec prix moyen
  const result: Record<string, { count: number; value: number; averagePrice: number }> = {}
  Object.entries(languageData).forEach(([language, data]) => {
    result[language] = {
      count: data.count,
      value: data.value,
      averagePrice: data.count > 0 ? data.value / data.count : 0,
    }
  })

  return result
}
