"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { PokemonItem } from "@/types/collection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Check, RefreshCw, Lock } from "lucide-react"
import { PhotoService } from "@/lib/photo-service"
import { LocalStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface PhotoSelectorProps {
  item: Partial<PokemonItem>
  onSelect: (photoUrl: string) => void
  children: React.ReactNode
}

export function PhotoSelector({ item, onSelect, children }: PhotoSelectorProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photoOptions, setPhotoOptions] = useState<Array<{ url: string; source: string; description: string }>>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string>("")

  useEffect(() => {
    if (open && item.name && item.type) {
      loadPhotoOptions()
    }
  }, [open, item.name, item.type])

  const loadPhotoOptions = async () => {
    // Vérifier les limites du plan
    const limits = LocalStorage.checkPlanLimits()
    if (!limits.canAddPhoto) {
      toast({
        title: "Fonctionnalité Premium",
        description: "L'ajout de photos est réservé aux utilisateurs Premium. Passez au plan Premium pour utiliser cette fonctionnalité.",
        variant: "destructive",
      })
      setOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const options = PhotoService.generateImageOptions(item as PokemonItem)
      setPhotoOptions(options)
    } catch (error) {
      console.error("Erreur lors du chargement des photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedPhoto) {
      onSelect(selectedPhoto)
      setOpen(false)
    }
  }

  const generateNewOptions = () => {
    loadPhotoOptions()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Vérifier les limites avant d'ouvrir
      const limits = LocalStorage.checkPlanLimits()
      if (!limits.canAddPhoto) {
        toast({
          title: "Fonctionnalité Premium",
          description: "L'ajout de photos est réservé aux utilisateurs Premium. Passez au plan Premium pour utiliser cette fonctionnalité.",
          variant: "destructive",
        })
        return
      }
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Choisir une photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Recherche de photos...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {photoOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-lg border-2 transition-colors ${
                      selectedPhoto === option.url ? "border-primary" : "border-muted"
                    }`}
                    onClick={() => setSelectedPhoto(option.url)}
                  >
                    <img
                      src={option.url || "/placeholder.svg"}
                      alt={option.description}
                      className="w-full h-24 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=96&width=150"
                      }}
                    />
                    {selectedPhoto === option.url && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-md">
                      {option.source}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateNewOptions} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouvelles options
                </Button>
                <Button onClick={handleSelect} disabled={!selectedPhoto} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Sélectionner
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
