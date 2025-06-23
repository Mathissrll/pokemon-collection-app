import type { PokemonItem } from "@/types/collection"

export interface LanguageInfo {
  code: PokemonItem["language"]
  name: string
  flag: string
  marketMultiplier: number // Multiplicateur de prix par rapport au français (base 1.0)
  rarity: "commune" | "rare" | "tres-rare"
}

export const LANGUAGES: LanguageInfo[] = [
  {
    code: "francais",
    name: "Français",
    flag: "🇫🇷",
    marketMultiplier: 1.0,
    rarity: "commune",
  },
  {
    code: "anglais",
    name: "Anglais",
    flag: "🇺🇸",
    marketMultiplier: 1.2,
    rarity: "commune",
  },
  {
    code: "japonais",
    name: "Japonais",
    flag: "🇯🇵",
    marketMultiplier: 1.8,
    rarity: "rare",
  },
  {
    code: "allemand",
    name: "Allemand",
    flag: "🇩🇪",
    marketMultiplier: 0.9,
    rarity: "commune",
  },
  {
    code: "italien",
    name: "Italien",
    flag: "🇮🇹",
    marketMultiplier: 0.8,
    rarity: "commune",
  },
  {
    code: "espagnol",
    name: "Espagnol",
    flag: "🇪🇸",
    marketMultiplier: 0.85,
    rarity: "commune",
  },
  {
    code: "coreen",
    name: "Coréen",
    flag: "🇰🇷",
    marketMultiplier: 1.5,
    rarity: "rare",
  },
  {
    code: "chinois-traditionnel",
    name: "Chinois Traditionnel",
    flag: "🇹🇼",
    marketMultiplier: 1.3,
    rarity: "rare",
  },
  {
    code: "chinois-simplifie",
    name: "Chinois Simplifié",
    flag: "🇨🇳",
    marketMultiplier: 1.1,
    rarity: "rare",
  },
  {
    code: "portugais",
    name: "Portugais",
    flag: "🇵🇹",
    marketMultiplier: 0.7,
    rarity: "rare",
  },
  {
    code: "russe",
    name: "Russe",
    flag: "🇷🇺",
    marketMultiplier: 0.6,
    rarity: "tres-rare",
  },
  {
    code: "autre",
    name: "Autre",
    flag: "🌍",
    marketMultiplier: 1.0,
    rarity: "commune",
  },
]

export function getLanguageInfo(code: PokemonItem["language"]): LanguageInfo {
  return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0]
}

export function getLanguageLabel(code: PokemonItem["language"]): string {
  const info = getLanguageInfo(code)
  return `${info.flag} ${info.name}`
}

export function getLanguageMultiplier(code: PokemonItem["language"]): number {
  return getLanguageInfo(code).marketMultiplier
}

export function getLanguagesByRarity(rarity: LanguageInfo["rarity"]): LanguageInfo[] {
  return LANGUAGES.filter((lang) => lang.rarity === rarity)
}

export function getMostValuableLanguages(): LanguageInfo[] {
  return LANGUAGES.filter((lang) => lang.marketMultiplier >= 1.3).sort(
    (a, b) => b.marketMultiplier - a.marketMultiplier,
  )
}
