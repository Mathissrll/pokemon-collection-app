"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Plus } from "lucide-react"
import { getTypeLabel, formatCurrency } from "@/lib/utils"
import type { PokemonItem } from "@/types/collection"

interface PopularItem {
  name: string
  type: PokemonItem["type"]
  estimatedPrice: number
  trend: "up" | "down" | "stable"
}

const popularItems: PopularItem[] = [
  { name: "Booster Box Évolutions Prismatiques", type: "booster-box", estimatedPrice: 105.0, trend: "up" },
  { name: "Coffret Dresseur d'Élite Destinées Paldéennes", type: "etb", estimatedPrice: 48.5, trend: "up" },
  { name: "Charizard ex Alt Art", type: "single-card", estimatedPrice: 125.0, trend: "stable" },
  { name: "Collection Premium Pikachu", type: "premium-collection", estimatedPrice: 64.5, trend: "down" },
  { name: "Tin Koraidon ex", type: "tin", estimatedPrice: 21.5, trend: "up" },
  { name: "Deck de Combat Miraidon ex", type: "battle-deck", estimatedPrice: 27.5, trend: "stable" },
  { name: "Protège-Cartes Charizard", type: "sleeves", estimatedPrice: 12.5, trend: "up" },
]

interface PopularItemsProps {
  onAddItem: (item: Partial<PokemonItem>) => void
}

export function PopularItems({ onAddItem }: PopularItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Produits populaires français
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {popularItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">{item.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel(item.type)}
                </Badge>
                <span className="text-sm font-medium">{formatCurrency(item.estimatedPrice)}</span>
                <span
                  className={`text-xs ${
                    item.trend === "up"
                      ? "text-green-600"
                      : item.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {item.trend === "up" ? "↗️" : item.trend === "down" ? "↘️" : "→"}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAddItem({
                  name: item.name,
                  type: item.type,
                  estimatedValue: item.estimatedPrice,
                  purchasePrice: item.estimatedPrice * 0.85, // Prix d'achat estimé à 85%
                })
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
