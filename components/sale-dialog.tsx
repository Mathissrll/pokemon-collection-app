"use client"

import type React from "react"

import { useState } from "react"
import type { PokemonItem } from "@/types/collection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SaleDialogProps {
  item: PokemonItem
  onSale: () => void
  children: React.ReactNode
}

export function SaleDialog({ item, onSale, children }: SaleDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saleData, setSaleData] = useState({
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: item.estimatedValue.toString(),
    buyer: "",
    platform: "",
    notes: "",
  })

  const potentialProfit = Number.parseFloat(saleData.salePrice) - item.purchasePrice
  const potentialProfitPercentage = (potentialProfit / item.purchasePrice) * 100

  const handleSale = async () => {
    if (!saleData.salePrice) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prix de vente.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      LocalStorage.sellItem(item.id, {
        saleDate: saleData.saleDate,
        salePrice: Number.parseFloat(saleData.salePrice),
        buyer: saleData.buyer || undefined,
        platform: saleData.platform || undefined,
        notes: saleData.notes || undefined,
      })

      toast({
        title: "Vente enregistrée",
        description: `${item.name} a été marqué comme vendu !`,
      })

      setOpen(false)
      onSale()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Vendre {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Résumé de l'objet */}
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prix d'achat:</span>
              <span className="font-medium">{formatCurrency(item.purchasePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Valeur estimée:</span>
              <span className="font-medium">{formatCurrency(item.estimatedValue)}</span>
            </div>
          </div>

          {/* Formulaire de vente */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Prix de vente (€) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={saleData.salePrice}
                onChange={(e) => setSaleData((prev) => ({ ...prev, salePrice: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleDate">Date de vente</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleData.saleDate}
                onChange={(e) => setSaleData((prev) => ({ ...prev, saleDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Plateforme de vente</Label>
              <Select
                value={saleData.platform}
                onValueChange={(value) => setSaleData((prev) => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardmarket">CardMarket</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="leboncoin">Le Bon Coin</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
                  <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                  <SelectItem value="magasin">Magasin local</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer">Acheteur (optionnel)</Label>
              <Input
                id="buyer"
                placeholder="Nom ou pseudo de l'acheteur"
                value={saleData.buyer}
                onChange={(e) => setSaleData((prev) => ({ ...prev, buyer: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes sur la vente..."
                value={saleData.notes}
                onChange={(e) => setSaleData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          {/* Aperçu du profit */}
          {saleData.salePrice && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit/Perte:</span>
                <div className="flex items-center gap-2">
                  {potentialProfit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${potentialProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(potentialProfit)} ({potentialProfitPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSale} disabled={isLoading} className="flex-1">
              {isLoading ? "Enregistrement..." : "Confirmer la vente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
