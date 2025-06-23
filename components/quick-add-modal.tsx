"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Euro, TrendingUp, Loader2 } from "lucide-react"
import type { AutoProductResult } from "@/lib/auto-cardmarket-service"
import type { PokemonItem } from "@/types/collection"
import { formatCurrency } from "@/lib/utils"

interface QuickAddModalProps {
  product: AutoProductResult | null
  open: boolean
  onClose: () => void
  onAdd: (data: {
    purchasePrice: number
    condition: PokemonItem["condition"]
    storageLocation: string
  }) => void
  isLoading?: boolean
}

export function QuickAddModal({ product, open, onClose, onAdd, isLoading = false }: QuickAddModalProps) {
  const [formData, setFormData] = useState({
    purchasePrice: "",
    condition: "neuf" as PokemonItem["condition"],
    storageLocation: "",
  })

  // Pré-remplir le prix quand le produit change
  useEffect(() => {
    if (product) {
      const suggestedPrice = product.cardMarketPrice.trendPrice * 0.85
      setFormData((prev) => ({
        ...prev,
        purchasePrice: suggestedPrice.toFixed(2),
      }))
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.purchasePrice || isLoading) return

    onAdd({
      purchasePrice: Number.parseFloat(formData.purchasePrice),
      condition: formData.condition,
      storageLocation: formData.storageLocation,
    })
  }

  if (!product) return null

  const profitEstimate = product.cardMarketPrice.trendPrice - Number.parseFloat(formData.purchasePrice || "0")
  const profitPercentage = formData.purchasePrice
    ? (profitEstimate / Number.parseFloat(formData.purchasePrice)) * 100
    : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Ajouter à la collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aperçu du produit */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            {product.image && (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.product.name}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-sm">{product.product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.product.series}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  🇫🇷 Cote: {formatCurrency(product.cardMarketPrice.trendPrice)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prix d'achat */}
            <div className="space-y-2">
              <Label htmlFor="quick-price">Prix d'achat (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quick-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Estimation de profit */}
              {formData.purchasePrice && (
                <div
                  className={`text-xs p-2 rounded ${profitEstimate >= 0 ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"}`}
                >
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      Plus-value estimée: {formatCurrency(profitEstimate)} ({profitPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* État */}
            <div className="space-y-2">
              <Label>État</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: PokemonItem["condition"]) =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neuf">Neuf</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="bon">Bon</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="abime">Abîmé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lieu de stockage */}
            <div className="space-y-2">
              <Label htmlFor="quick-storage">Lieu de stockage</Label>
              <Input
                id="quick-storage"
                placeholder="Ex: Étagère salon..."
                value={formData.storageLocation}
                onChange={(e) => setFormData((prev) => ({ ...prev, storageLocation: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !formData.purchasePrice}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
