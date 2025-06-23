"use client"

import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CardMarketService } from "@/lib/cardmarket-service"

interface CardMarketInfoProps {
  item: PokemonItem
}

export function CardMarketInfo({ item }: CardMarketInfoProps) {
  const hasCustomUrl = item.cardMarketUrl && CardMarketService.isValidCardMarketUrl(item.cardMarketUrl)
  const productInfo = hasCustomUrl ? CardMarketService.getProductInfoFromUrl(item.cardMarketUrl!) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Informations CardMarket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCustomUrl ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="default">URL Personnalisée</Badge>
              {productInfo && <Badge variant="secondary">ID: {productInfo.id}</Badge>}
            </div>

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source des prix:</span>
                <span className="font-medium">Lien spécifique</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Précision:</span>
                <span className="font-medium text-green-600">Élevée</span>
              </div>
            </div>

            {item.cardMarketPrice && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Prix depuis votre lien</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Prix bas:</span>
                    <span className="font-medium">{formatCurrency(item.cardMarketPrice.lowPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tendance:</span>
                    <span className="font-medium">{formatCurrency(item.cardMarketPrice.trendPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moyenne:</span>
                    <span className="font-medium">{formatCurrency(item.cardMarketPrice.averagePrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="outline">URL Générique</Badge>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source des prix:</span>
                <span className="font-medium">Estimation générale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Précision:</span>
                <span className="font-medium text-orange-600">Moyenne</span>
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Conseil</span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Ajoutez un lien CardMarket spécifique pour obtenir des prix plus précis et en temps réel.
              </p>
            </div>
          </>
        )}

        <Button
          variant="outline"
          onClick={() =>
            window.open(
              item.cardMarketUrl ||
                `https://www.cardmarket.com/fr/Pokemon/Products?searchString=${encodeURIComponent(item.name)}`,
              "_blank",
            )
          }
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Voir sur CardMarket
        </Button>
      </CardContent>
    </Card>
  )
}
