"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Check } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { EbaySoldListing } from "@/lib/ebay-sold-listings-service"

interface EbaySalesSelectorProps {
  searchTerm: string
  sales: EbaySoldListing[]
  totalSales: number
  searchUrl: string
  selectedPrice?: number
  onSelectPrice: (price: number, sale: EbaySoldListing) => void
}

export function EbaySalesSelector({
  searchTerm,
  sales,
  totalSales,
  searchUrl,
  selectedPrice,
  onSelectPrice,
}: EbaySalesSelectorProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hier"
    if (diffDays === 0) return "Aujourd'hui"
    return `Il y a ${diffDays} jours`
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-700 dark:text-green-300">
                3 dernières ventes : "{searchTerm}"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400">{totalSales} ventes trouvées</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(searchUrl, "_blank")}
                className="h-6 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Liste des 3 dernières ventes */}
          <div className="space-y-3">
            {sales.map((sale, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPrice === sale.soldPrice
                    ? "ring-2 ring-green-500 bg-green-100 dark:bg-green-900"
                    : "hover:bg-green-50 dark:hover:bg-green-900/50"
                }`}
                onClick={() => onSelectPrice(sale.soldPrice, sale)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-green-700 dark:text-green-300">
                          {formatCurrency(sale.soldPrice)}
                        </span>
                        {sale.shipping > 0 && (
                          <span className="text-xs text-muted-foreground">+ {formatCurrency(sale.shipping)} port</span>
                        )}
                        {selectedPrice === sale.soldPrice && <Check className="h-4 w-4 text-green-600" />}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {sale.condition}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{getDaysAgo(sale.soldDate)}</span>
                        <span className="text-xs text-muted-foreground">{sale.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">{sale.seller.name}</span>
                          <span className="ml-2">
                            ⭐ {sale.seller.feedbackPercentage}% ({sale.seller.feedback})
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(sale.soldDate)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-xs text-green-600 dark:text-green-400">
              👆 Clique sur une vente pour utiliser son prix comme valeur estimée
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
