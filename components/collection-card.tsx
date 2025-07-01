"use client"

import { useState, useEffect } from "react"
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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface CollectionCardProps {
  item: PokemonItem
  onEdit: (item: PokemonItem) => void
  onDelete: (id: string) => void
}

export function CollectionCard({ item, onEdit, onDelete }: CollectionCardProps) {
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [isUpdatingEbayPrice, setIsUpdatingEbayPrice] = useState(false)
  const [ebayData, setEbayData] = useState<{ median: number, listings: any[]; searchUrl?: string }|null>(null)
  const [ebayLoading, setEbayLoading] = useState(false)

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

  const fetchEbayCote = async () => {
    setEbayLoading(true)
    try {
      const res = await getMedianSoldPriceForItem(item.name, item.language)
      setEbayData({ median: res.median, listings: res.listings, searchUrl: `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(item.name + ' ' + item.language)}&_sacat=0&LH_Sold=1&LH_Complete=1&_sop=13` })
    } finally {
      setEbayLoading(false)
    }
  }

  useEffect(() => {
    fetchEbayCote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.name, item.language])

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
          <div className="w-full text-center pb-2 text-xs flex flex-col items-center gap-1">
            {ebayLoading ? (
              <span className="text-gray-400">Recherche cote eBay...</span>
            ) : ebayData && ebayData.median ? (
              <>
                <span className="text-blue-600 font-semibold">Cote eBay : {ebayData.median} €</span>
                <span className="text-xs text-gray-500">{ebayData.listings.length} ventes analysées</span>
                <a
                  href={ebayData.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  Voir sur eBay <ExternalLink className="w-3 h-3 inline" />
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); fetchEbayCote() }}
                  disabled={ebayLoading}
                >
                  <RefreshCw className={ebayLoading ? "animate-spin mr-1 w-3 h-3" : "mr-1 w-3 h-3"} /> Rafraîchir la cote
                </Button>
                {ebayData.listings.length > 0 && (
                  <div className="w-full h-24 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ebayData.listings.slice(0, 10).reverse()} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="soldDate" tick={{ fontSize: 10 }} hide={false} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip formatter={(value) => `${value} €`} labelFormatter={d => `Date : ${d}`} />
                        <Line type="monotone" dataKey="soldPrice" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">Aucune cote eBay</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
