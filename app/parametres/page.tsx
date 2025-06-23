"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Palette, Database, Download, Upload, Trash2, MapPin, Info, Share2, AlertCircle, User } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import type { AppSettings } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"
import { ShareCollection } from "@/components/share-collection"
import { SyncStats } from "@/components/sync-stats"
import { AuthDialog } from "@/components/auth-dialog"
import { PlanInfo } from "@/components/plan-info"

export default function ParametresPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [settings, setSettings] = useState<AppSettings>({
    theme: "system",
    currency: "EUR",
    defaultStorageLocation: "",
  })
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkAuth = () => {
      const user = LocalStorage.getCurrentUser()
      setIsLoggedIn(!!user)
    }
    
    checkAuth()
    // Vérifier l'authentification toutes les 5 secondes
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoggedIn && mounted) {
      const savedSettings = LocalStorage.getSettings()
      setSettings(savedSettings)
    }
  }, [isLoggedIn, mounted])

  const handleSaveSettings = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder vos paramètres.",
        variant: "destructive",
      })
      return
    }

    const success = LocalStorage.saveSettings(settings)
    if (success) {
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour.",
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres. Vérifiez votre connexion.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour exporter vos données.",
        variant: "destructive",
      })
      return
    }

    const collection = LocalStorage.getCollection()
    const data = {
      collection,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pokemon-collection-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Sauvegarde créée",
      description: "Vos données ont été exportées avec succès.",
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour importer des données.",
        variant: "destructive",
      })
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.collection && Array.isArray(data.collection)) {
          const success = LocalStorage.saveCollection(data.collection)
          if (success) {
            if (data.settings) {
              LocalStorage.saveSettings(data.settings)
              setSettings(data.settings)
            }
            toast({
              title: "Import réussi",
              description: "Vos données ont été restaurées.",
            })
          } else {
            toast({
              title: "Erreur",
              description: "Impossible de sauvegarder les données importées. Vérifiez votre connexion.",
              variant: "destructive",
            })
          }
        } else {
          throw new Error("Format invalide")
        }
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Le fichier sélectionné n'est pas valide.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const handleClearData = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour supprimer vos données.",
        variant: "destructive",
      })
      return
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.")) {
      localStorage.clear()
      toast({
        title: "Données supprimées",
        description: "Toutes vos données ont été effacées.",
      })
      window.location.reload()
    }
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true)
    toast({
      title: "Connexion réussie",
      description: "Vous pouvez maintenant accéder à vos paramètres.",
    })
  }

  if (!mounted) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4">
        <Header title="Paramètres" />

        <div className="py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Connexion requise
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vous devez être connecté</h3>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder à vos paramètres et gérer votre compte.
              </p>
              <AuthDialog onAuthSuccess={handleAuthSuccess}>
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
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
    <div className="container mx-auto px-4">
      <Header title="Paramètres" />

      <div className="py-6 space-y-6">
        {/* Informations du plan */}
        <PlanInfo />

        {/* Paramètres d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Thème</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Devise</Label>
              <Select
                value={settings.currency}
                onValueChange={(value: "EUR" | "USD") =>
                  setSettings((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-location" className="text-sm font-medium">
                Lieu de stockage par défaut
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storage-location"
                  placeholder="Ex: Boîte 1, Étagère 2..."
                  value={settings.defaultStorageLocation}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, defaultStorageLocation: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              Sauvegarder les paramètres
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Gestion des données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Gestion des données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExportData} className="h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <Download className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Exporter</div>
                    <div className="text-xs text-muted-foreground">Sauvegarder mes données</div>
                  </div>
                </div>
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full h-auto p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium">Importer</div>
                      <div className="text-xs text-muted-foreground">Restaurer des données</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <Button variant="destructive" onClick={handleClearData} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer toutes les données
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Partage et synchronisation */}
        <ShareCollection>
          <Button variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Partager ma collection
          </Button>
        </ShareCollection>
        <SyncStats />

        <Separator />

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              À propos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Version : 1.0.0</p>
              <p>Application de gestion de collection Pokémon</p>
              <p className="mt-2">
                Cette application vous permet de gérer votre collection de cartes et produits Pokémon
                de manière simple et efficace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
