"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Euro, Save, Calendar, FileText, AlertCircle, Crown } from "lucide-react"
import type { PokemonItem } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"
import { LocalStorage } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ManualAddFormProps {
  onAdd: (data: Omit<PokemonItem, "id" | "addedDate">) => void
  isLoading?: boolean
}

export function ManualAddForm({ onAdd, isLoading = false }: ManualAddFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    type: "booster-pack" as PokemonItem["type"],
    language: "francais" as PokemonItem["language"],
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    condition: "neuf" as PokemonItem["condition"],
    photo: "",
    notes: "",
  })
  const [planLimits, setPlanLimits] = useState<{ canAddItem: boolean; canAddPhoto: boolean; error?: string }>({
    canAddItem: true,
    canAddPhoto: true,
  })

  useEffect(() => {
    const limits = LocalStorage.checkPlanLimits()
    setPlanLimits(limits)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.purchasePrice || isLoading) return

    // Vérifier les limites avant d'ajouter
    const limits = LocalStorage.checkPlanLimits()
    if (!limits.canAddItem) {
      toast({
        title: "Limite atteinte",
        description: limits.error || "Impossible d'ajouter plus d'objets avec votre plan actuel.",
        variant: "destructive",
      })
      return
    }

    onAdd({
      name: formData.name,
      type: formData.type,
      language: formData.language,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number.parseFloat(formData.purchasePrice),
      estimatedValue: Number.parseFloat(formData.purchasePrice), // Utilise le prix d'achat comme valeur estimée par défaut
      condition: formData.condition,
      photo: planLimits.canAddPhoto ? (formData.photo || undefined) : undefined,
      storageLocation: "", // Valeur par défaut vide
      notes: formData.notes || undefined,
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Afficher les informations du plan */}
        {!planLimits.canAddPhoto && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <span>Plan Gratuit : Photos non disponibles</span>
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Passez au plan Premium pour ajouter des photos à vos objets.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {!planLimits.canAddItem && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <span>Limite de 20 objets atteinte</span>
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm mt-1">
                Passez au plan Premium pour ajouter plus d'objets à votre collection.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom du produit *
            </Label>
            <Input
              id="name"
              placeholder="Ex: Booster Écarlate et Violet, ETB Obsidienne..."
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              disabled={isLoading || !planLimits.canAddItem}
              className="h-10"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type de produit</Label>
            <Select
              value={formData.type}
              onValueChange={(value: PokemonItem["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
              disabled={isLoading || !planLimits.canAddItem}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Produits scellés principaux */}
                <SelectItem value="booster-pack">🎴 Booster</SelectItem>
                <SelectItem value="booster-box">📦 Bundle</SelectItem>
                <SelectItem value="display">📋 Display de Boosters</SelectItem>
                <SelectItem value="etb">🎁 Boîte d'Entraînement d'Élite</SelectItem>
                <SelectItem value="coffret">📦 Coffret</SelectItem>
                <SelectItem value="collection-box">🎁 Boîte de Collection</SelectItem>
                <SelectItem value="premium-collection">💎 Collection Premium</SelectItem>
                <SelectItem value="tin">🥫 Boîte Métallique</SelectItem>
                
                {/* Decks */}
                <SelectItem value="deck-preconstruit">🃏 Jeu Préconstruit</SelectItem>
                <SelectItem value="battle-deck">⚔️ Jeu de Combat</SelectItem>
                <SelectItem value="theme-deck">🎭 Jeu à Thème</SelectItem>
                <SelectItem value="starter-deck">🚀 Jeu de Démarrage</SelectItem>
                
                {/* Cartes individuelles */}
                <SelectItem value="single-card">🃏 Carte Individuelle</SelectItem>
                <SelectItem value="promo-card">⭐ Carte Promotionnelle</SelectItem>
                
                {/* Accessoires */}
                <SelectItem value="accessoire">🔧 Accessoire</SelectItem>
                <SelectItem value="sleeves">🛡️ Protège-Cartes</SelectItem>
                <SelectItem value="playmat">🎯 Tapis de Jeu</SelectItem>
                <SelectItem value="deckbox">📦 Boîte de Jeu</SelectItem>
                <SelectItem value="binder">📁 Classeur</SelectItem>
                <SelectItem value="toploader">📏 Protège-Carte Rigide</SelectItem>
                
                {/* Autre */}
                <SelectItem value="autre">📋 Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prix */}
          <div className="space-y-2">
            <Label htmlFor="purchase-price" className="text-sm font-medium">
              Prix d'achat (€) *
            </Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                className="pl-10 h-10"
                required
                disabled={isLoading || !planLimits.canAddItem}
              />
            </div>
          </div>

          {/* Langue et État */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Langue</Label>
              <Select
                value={formData.language}
                onValueChange={(value: PokemonItem["language"]) =>
                  setFormData((prev) => ({ ...prev, language: value }))
                }
                disabled={isLoading || !planLimits.canAddItem}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="francais">🇫🇷 Français</SelectItem>
                  <SelectItem value="anglais">🇺🇸 Anglais</SelectItem>
                  <SelectItem value="japonais">🇯🇵 Japonais</SelectItem>
                  <SelectItem value="allemand">🇩🇪 Allemand</SelectItem>
                  <SelectItem value="espagnol">🇪🇸 Espagnol</SelectItem>
                  <SelectItem value="italien">🇮🇹 Italien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">État</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: PokemonItem["condition"]) =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
                disabled={isLoading || !planLimits.canAddItem}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neuf">✨ Neuf</SelectItem>
                  <SelectItem value="excellent">⭐ Excellent</SelectItem>
                  <SelectItem value="bon">👍 Bon</SelectItem>
                  <SelectItem value="moyen">👌 Moyen</SelectItem>
                  <SelectItem value="abime">💔 Abîmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date d'achat */}
          <div className="space-y-2">
            <Label htmlFor="purchase-date" className="text-sm font-medium">
              Date d'achat
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="purchase-date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                className="pl-10 h-10"
                disabled={isLoading || !planLimits.canAddItem}
              />
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-sm font-medium">
              URL de la photo (optionnel)
            </Label>
            <Input
              id="photo"
              type="url"
              placeholder="https://..."
              value={formData.photo}
              onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
              disabled={isLoading || !planLimits.canAddPhoto}
              className="h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Notes optionnelles sur cet objet..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="pl-10 min-h-[80px]"
                disabled={isLoading || !planLimits.canAddItem}
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={isLoading || !planLimits.canAddItem || !formData.name || !formData.purchasePrice}
            className="w-full h-10"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Ajouter à ma collection
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
