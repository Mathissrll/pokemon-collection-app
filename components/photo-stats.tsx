"use client"

import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ImageIcon } from "lucide-react"

interface PhotoStatsProps {
  items: PokemonItem[]
}

export function PhotoStats({ items }: PhotoStatsProps) {
  const totalItems = items.length
  const itemsWithPhotos = items.filter((item) => item.photo).length
  const itemsWithoutPhotos = totalItems - itemsWithPhotos
  const photoPercentage = totalItems > 0 ? (itemsWithPhotos / totalItems) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Photos de la collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Objets avec photo:</span>
          <span className="font-bold">{itemsWithPhotos}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Objets sans photo:</span>
          <span className="font-bold text-orange-600">{itemsWithoutPhotos}</span>
        </div>
        <Progress value={photoPercentage} className="h-2" />
        <div className="text-sm text-muted-foreground text-center">
          {photoPercentage.toFixed(1)}% de la collection a une photo
        </div>
        {itemsWithoutPhotos > 0 && (
          <div className="text-xs text-orange-600 text-center">
            💡 Utilisez le bouton "Photos" pour générer automatiquement les images manquantes
          </div>
        )}
      </CardContent>
    </Card>
  )
}
