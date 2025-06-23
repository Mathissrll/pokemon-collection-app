"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertCircle } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import type { PokemonItem } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"
import { ManualAddForm } from "@/components/manual-add-form"
import { AuthDialog } from "@/components/auth-dialog"

export default function AjouterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const user = LocalStorage.getCurrentUser()
      setIsLoggedIn(!!user)
    }
    
    checkAuth()
    // Vérifier l'authentification toutes les 5 secondes
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleManualAdd = async (itemData: Omit<PokemonItem, "id" | "addedDate">) => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des objets à votre collection.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const newItem = await LocalStorage.addItem(itemData)

      if (newItem) {
        toast({
          title: "✅ Ajouté à la collection !",
          description: `${itemData.name} ajouté avec succès`,
        })

        setTimeout(() => {
          router.push("/collection")
        }, 1500)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'objet. Vérifiez votre connexion.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true)
    toast({
      title: "Connexion réussie",
      description: "Vous pouvez maintenant ajouter des objets à votre collection.",
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 max-w-md">
        <Header title="Ajouter un objet" />

        <div className="py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Connexion requise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous devez être connecté pour ajouter des objets à votre collection Pokémon.
              </p>
              
              <AuthDialog onAuthSuccess={handleAuthSuccess}>
                <Button className="w-full">
                  Se connecter / S'inscrire
                </Button>
              </AuthDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 max-w-md">
      <Header title="Ajouter un objet" />

      <div className="py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ajouter un objet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ManualAddForm onAdd={handleManualAdd} isLoading={isAdding} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
