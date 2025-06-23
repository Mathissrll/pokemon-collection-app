"use client"

import { useState } from "react"
import Link from "next/link"
import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Trash2, MapPin, RefreshCw, DollarSign, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate, getTypeLabel, getConditionLabel } from "@/lib/utils"
import { CardMarketService } from "@/lib/cardmarket-service"
import { LocalStorage } from "@/lib/storage"
import { CardMarketLinks } from "@/lib/cardmarket-links"
import { EditDialog } from "@/components/edit-dialog"
import { getMedianSoldPriceForItem } from "@/lib/ebay-sold-listings-service"
import { ChartContainer } from "@/components/ui/chart"
import { OptimizedImage } from "@/components/optimized-image"

interface CollectionCardProps {
  item: PokemonItem
  onEdit: (item: PokemonItem) => void
  onDelete: (id: string) => void
}

export function CollectionCard({ item, onEdit, onDelete }: CollectionCardProps) {
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [isUpdatingEbayPrice, setIsUpdatingEbayPrice] = useState(false)

  const profitLoss = item.estimatedValue - item.purchasePrice
  const profitLossPercentage = (profitLoss / item.purchasePrice) * 100

  const updateCardMarketPrice = async () => {
    setIsUpdatingPrice(true)
    try {
      const price = await CardMarketService.fetchPrice(item.name, item.type, item.language, item.cardMarketUrl)
      LocalStorage.updateCardMarketPrice(item.id, price)
      // Recharger l'item depuis le storage pour avoir les nouvelles données
      window.location.reload() // Solution simple pour cette démo
    } catch (error) {
      console.error("Erreur lors de la mise à jour du prix:", error)
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  const updateEbayPrice = async () => {
    setIsUpdatingEbayPrice(true)
    try {
      const { median } = await getMedianSoldPriceForItem(item.name, item.language)
      if (median && median > 0) {
        const newHistorique = Array.isArray(item.historiqueCote) ? [...item.historiqueCote] : []
        newHistorique.push({ date: new Date().toISOString(), valeur: median })
        LocalStorage.updateItem(item.id, {
          coteActuelle: median,
          historiqueCote: newHistorique,
        })
        window.location.reload() // Pour rafraîchir l'affichage
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la cote eBay:", error)
    } finally {
      setIsUpdatingEbayPrice(false)
    }
  }

  // Types d'objets scellés
  const sealedTypes = [
    "coffret",
    "etb",
    "booster-box",
    "display",
    "booster-pack",
  ]
  const isSealed = sealedTypes.includes(item.type)

  return (
    <Link href={`/collection/${item.id}`} className="block group">
      <Card className="overflow-hidden p-0 group-hover:shadow-lg transition-shadow">
        <CardContent className="p-0 flex flex-col items-center">
          <OptimizedImage
            src={item.photo || ""}
            alt={item.name}
            aspectRatio="square"
            containerClassName="w-full"
            className="group-hover:scale-105 transition-transform duration-200"
          />
          <div className="w-full text-center py-2 px-1 text-xs font-medium truncate">
            {item.name}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
