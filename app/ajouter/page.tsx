"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertCircle } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import type { PokemonItem } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"
import { ManualAddForm } from "@/components/manual-add-form"
import { AuthDialog } from "@/components/auth-dialog"
import { ConfirmEmailPrompt } from "@/components/confirm-email-prompt"

export default function AjouterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const [isAdding, setIsAdding] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [editItem, setEditItem] = useState<PokemonItem | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      const user = LocalStorage.getCurrentUser()
      setUser(user)
      setIsLoggedIn(!!user)
    }
    
    checkAuth()
    // Vérifier l'authentification toutes les 5 secondes
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (editId) {
      const collection = LocalStorage.getCollection()
      const found = collection.find((i: any) => i.id === editId)
      if (found) setEditItem(found)
    }
  }, [editId])

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
      let result
      if (editItem) {
        // Edition : update l'objet
        const ok = LocalStorage.updateItem(editItem.id, itemData)
        result = ok ? { ...editItem, ...itemData } : null
      } else {
        // Ajout classique
        result = await LocalStorage.addItem(itemData)
      }

      if (result) {
        toast({
          title: editItem ? "✅ Modifié !" : "✅ Ajouté à la collection !",
          description: `${itemData.name} ${editItem ? "modifié" : "ajouté"} avec succès`,
        })

        setTimeout(() => {
          router.push("/collection")
        }, 1500)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer l'objet. Vérifiez votre connexion.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout/édition:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
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

  // Protection email non confirmé
  if (user && user.isEmailConfirmed === false) {
    return (
      <div className="container mx-auto px-4 max-w-2xl flex flex-col items-center justify-center min-h-[80vh]">
        <ConfirmEmailPrompt
          email={user.email}
          onResend={async () => {
            await fetch("/api/send-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, username: user.username, token: user.emailConfirmationToken })
            })
          }}
        />
      </div>
    )
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
      <Header title={editItem ? "Modifier un objet" : "Ajouter un objet"} />

      <div className="py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ajouter un objet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ManualAddForm onAdd={handleManualAdd} isLoading={isAdding} initialData={editItem || undefined} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
