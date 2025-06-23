"use client"

import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart } from "lucide-react"
import { formatCurrency, getTypeCategory } from "@/lib/utils"

interface CategoryStatsProps {
  items: PokemonItem[]
  totalValue: number
}

export function CategoryStats({ items, totalValue }: CategoryStatsProps) {
  // Grouper par catégorie
  const categoryData: Record<string, { count: number; value: number; types: Set<string> }> = {}

  items.forEach((item) => {
    const category = getTypeCategory(item.type)
    if (!categoryData[category]) {
      categoryData[category] = { count: 0, value: 0, types: new Set() }
    }
    categoryData[category].count++
    categoryData[category].value += item.estimatedValue
    categoryData[category].types.add(item.type)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Répartition par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(categoryData)
          .sort(([, a], [, b]) => b.value - a.value)
          .map(([category, data]) => {
            const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span>
                    {data.count} objet{data.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(data.value)}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {data.types.size} type{data.types.size !== 1 ? "s" : ""} différent{data.types.size !== 1 ? "s" : ""}
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
