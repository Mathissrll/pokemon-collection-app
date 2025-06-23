"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { PokemonItem } from "@/types/collection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, Camera, RefreshCw } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { LANGUAGES } from "@/lib/languages"
import { PhotoService } from "@/lib/photo-service"

interface EditDialogProps {
  item: PokemonItem
  onEdit: () => void
  children: React.ReactNode
}

export function EditDialog({ item, onEdit, children }: EditDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type,
    language: item.language,
    barcode: item.barcode || "",
    purchaseDate: item.purchaseDate,
    purchasePrice: item.purchasePrice.toString(),
    estimatedValue: item.estimatedValue.toString(),
    condition: item.condition,
    photo: item.photo || "",
    storageLocation: item.storageLocation,
    notes: item.notes || "",
    cardMarketUrl: item.cardMarketUrl || "",
  })

  // Réinitialiser le formulaire quand l'item change
  useEffect(() => {
    setFormData({
      name: item.name,
      type: item.type,
      language: item.language,
      barcode: item.barcode || "",
      purchaseDate: item.purchaseDate,
      purchasePrice: item.purchasePrice.toString(),
      estimatedValue: item.estimatedValue.toString(),
      condition: item.condition,
      photo: item.photo || "",
      storageLocation: item.storageLocation,
      notes: item.notes || "",
      cardMarketUrl: item.cardMarketUrl || "",
    })
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.type || !formData.purchasePrice || !formData.estimatedValue) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const updatedItem: Partial<PokemonItem> = {
        name: formData.name,
        type: formData.type as PokemonItem["type"],
        language: formData.language as PokemonItem["language"],
        barcode: formData.barcode || undefined,
        purchaseDate: formData.purchaseDate,
        purchasePrice: Number.parseFloat(formData.purchasePrice),
        estimatedValue: Number.parseFloat(formData.estimatedValue),
        condition: formData.condition as PokemonItem["condition"],
        photo: formData.photo || undefined,
        storageLocation: formData.storageLocation,
        notes: formData.notes || undefined,
        cardMarketUrl: formData.cardMarketUrl || undefined,
      }

      LocalStorage.updateItem(item.id, updatedItem)

      toast({
        title: "✅ Objet modifié",
        description: "Les modifications ont été sauvegardées !",
      })

      setOpen(false)
      onEdit()
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAutoPhoto = async () => {
    setIsLoadingPhoto(true)
    try {
      const photoUrl = await PhotoService.getAutoImage({
        ...item,
        name: formData.name,
        type: formData.type,
      })
      setFormData((prev) => ({ ...prev, photo: photoUrl }))
      toast({
        title: "Photo générée",
        description: "Une photo automatique a été trouvée !",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer une photo automatique.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPhoto(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: PokemonItem["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coffret">Coffret</SelectItem>
                <SelectItem value="etb">Elite Trainer Box</SelectItem>
                <SelectItem value="booster-box">Booster Box</SelectItem>
                <SelectItem value="display">Display</SelectItem>
                <SelectItem value="booster-pack">Booster Pack</SelectItem>
                <SelectItem value="single-card">Carte Individuelle</SelectItem>
                <SelectItem value="promo-card">Carte Promo</SelectItem>
                <SelectItem value="deck-preconstruit">Deck Préconstruit</SelectItem>
                <SelectItem value="battle-deck">Battle Deck</SelectItem>
                <SelectItem value="theme-deck">Theme Deck</SelectItem>
                <SelectItem value="starter-deck">Starter Deck</SelectItem>
                <SelectItem value="tin">Tin/Boîte Métal</SelectItem>
                <SelectItem value="collection-box">Collection Box</SelectItem>
                <SelectItem value="premium-collection">Premium Collection</SelectItem>
                <SelectItem value="accessoire">Accessoire</SelectItem>
                <SelectItem value="sleeves">Protège-Cartes</SelectItem>
                <SelectItem value="playmat">Tapis de Jeu</SelectItem>
                <SelectItem value="deckbox">Deck Box</SelectItem>
                <SelectItem value="binder">Classeur</SelectItem>
                <SelectItem value="toploader">Toploader</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Langue */}
          <div className="space-y-2">
            <Label>Langue *</Label>
            <Select
              value={formData.language}
              onValueChange={(value: PokemonItem["language"]) => setFormData((prev) => ({ ...prev, language: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code-barres */}
          <div className="space-y-2">
            <Label htmlFor="edit-barcode">Code-barres</Label>
            <Input
              id="edit-barcode"
              value={formData.barcode}
              onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
            />
          </div>

          {/* Date d'achat */}
          <div className="space-y-2">
            <Label htmlFor="edit-purchaseDate">Date d'achat</Label>
            <Input
              id="edit-purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
            />
          </div>

          {/* Prix d'achat */}
          <div className="space-y-2">
            <Label htmlFor="edit-purchasePrice">Prix d'achat (€) *</Label>
            <Input
              id="edit-purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: e.target.value }))}
              required
            />
          </div>

          {/* Valeur estimée */}
          <div className="space-y-2">
            <Label htmlFor="edit-estimatedValue">Valeur estimée (€) *</Label>
            <Input
              id="edit-estimatedValue"
              type="number"
              step="0.01"
              value={formData.estimatedValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, estimatedValue: e.target.value }))}
              required
            />
          </div>

          {/* État */}
          <div className="space-y-2">
            <Label>État</Label>
            <Select
              value={formData.condition}
              onValueChange={(value: PokemonItem["condition"]) =>
                setFormData((prev) => ({ ...prev, condition: value }))
              }
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

          {/* Photo avec génération automatique */}
          <div className="space-y-2">
            <Label htmlFor="edit-photo">Photo</Label>
            <div className="flex gap-2">
              <Input
                id="edit-photo"
                type="url"
                placeholder="https://..."
                value={formData.photo}
                onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={generateAutoPhoto} disabled={isLoadingPhoto}>
                {isLoadingPhoto ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </div>
            {formData.photo && (
              <div className="mt-2">
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={formData.photo || "/placeholder.svg"}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lieu de stockage */}
          <div className="space-y-2">
            <Label htmlFor="edit-storageLocation">Lieu de stockage</Label>
            <Input
              id="edit-storageLocation"
              value={formData.storageLocation}
              onChange={(e) => setFormData((prev) => ({ ...prev, storageLocation: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* URL CardMarket */}
          <div className="space-y-2">
            <Label htmlFor="edit-cardMarketUrl">Lien CardMarket</Label>
            <Input
              id="edit-cardMarketUrl"
              type="url"
              value={formData.cardMarketUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardMarketUrl: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
