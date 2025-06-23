"use client"

import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe } from "lucide-react"
import { formatCurrency, calculateLanguageStats } from "@/lib/utils"
import { getLanguageLabel, getMostValuableLanguages } from "@/lib/languages"

interface LanguageStatsProps {
  items: PokemonItem[]
  totalValue: number
}

export function LanguageStats({ items, totalValue }: LanguageStatsProps) {
  const languageStats = calculateLanguageStats(items)
  const valuableLanguages = getMostValuableLanguages()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Répartition par langue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(languageStats)
          .sort(([, a], [, b]) => b.value - a.value)
          .map(([language, data]) => {
            const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0
            return (
              <div key={language} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{getLanguageLabel(language as PokemonItem["language"])}</span>
                  <span>
                    {data.count} objet{data.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(data.value)}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">Prix moyen: {formatCurrency(data.averagePrice)}</div>
              </div>
            )
          })}

        {valuableLanguages.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              💎 Langues les plus valorisées
            </h4>
            <div className="space-y-1">
              {valuableLanguages.slice(0, 3).map((lang) => (
                <div key={lang.code} className="flex justify-between text-xs text-yellow-700 dark:text-yellow-300">
                  <span>
                    {lang.flag} {lang.name}
                  </span>
                  <span>+{((lang.marketMultiplier - 1) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
