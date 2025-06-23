"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { CollectionCard } from "@/components/collection-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Download, Plus, RefreshCw, AlertCircle, User, Package } from "lucide-react"
import Link from "next/link"
import { LocalStorage } from "@/lib/storage"
import type { PokemonItem } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"
import { LANGUAGES } from "@/lib/languages"
import { AuthService } from "@/lib/auth-service"
import { EbaySoldListingsService, getMedianSoldPriceForItem } from "@/lib/ebay-sold-listings-service"
import { AuthDialog } from "@/components/auth-dialog"

export default function CollectionPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<PokemonItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PokemonItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)

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

  useEffect(() => {
    if (isLoggedIn) {
      loadCollection()
    }
  }, [isLoggedIn])

  const loadCollection = () => {
    const collection = LocalStorage.getCollection()
    setItems(collection)
    setFilteredItems(collection)
  }

  useEffect(() => {
    filterAndSortItems()
  }, [items, searchTerm, filterType, statusFilter, languageFilter, sortBy])

  const filterAndSortItems = () => {
    let filtered = [...items]

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrage par type
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType)
    }

    // Filtrage par statut
    if (statusFilter === "available") {
      filtered = filtered.filter((item) => !item.isSold)
    } else if (statusFilter === "sold") {
      filtered = filtered.filter((item) => item.isSold)
    }

    // Filtrage par langue
    if (languageFilter !== "all") {
      filtered = filtered.filter((item) => item.language === languageFilter)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "date":
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        case "price":
          return b.purchasePrice - a.purchasePrice
        case "value":
          return b.estimatedValue - a.estimatedValue
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }

  const handleDelete = (id: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour modifier votre collection.",
        variant: "destructive",
      })
      return
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      const success = LocalStorage.deleteItem(id)
      if (success) {
        loadCollection()
        toast({
          title: "Objet supprimé",
          description: "L'objet a été retiré de votre collection.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'objet. Vérifiez votre connexion.",
          variant: "destructive",
        })
      }
    }
  }

  const handleExport = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour exporter votre collection.",
        variant: "destructive",
      })
      return
    }

    const csv = LocalStorage.exportToCSV(items)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pokemon-collection-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: "Votre collection a été exportée en CSV.",
    })
  }

  const handleUpdateAllPrices = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour mettre à jour les prix.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPrices(true)
    try {
      const updatedItems = [...items]
      let updatedCount = 0

      for (const item of updatedItems) {
        if (!item.isSold) {
          try {
            const result = await getMedianSoldPriceForItem(item.name, item.language)
            if (result && result.median) {
              const index = updatedItems.findIndex((i) => i.id === item.id)
              if (index !== -1) {
                updatedItems[index] = {
                  ...updatedItems[index],
                  estimatedValue: result.median,
                  updatedAt: new Date().toISOString(),
                }
                updatedCount++
              }
            }
          } catch (error) {
            console.warn(`Erreur lors de la mise à jour du prix pour ${item.name}:`, error)
          }
        }
      }

      if (updatedCount > 0) {
        const success = LocalStorage.saveCollection(updatedItems)
        if (success) {
          setItems(updatedItems)
          toast({
            title: "Prix mis à jour",
            description: `${updatedCount} objets ont été mis à jour avec les dernières cotes eBay.`,
          })
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de sauvegarder les mises à jour. Vérifiez votre connexion.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Aucune mise à jour",
          description: "Aucun prix n'a pu être mis à jour.",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des prix.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true)
    toast({
      title: "Connexion réussie",
      description: "Votre collection a été chargée.",
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4">
        <Header title="Ma Collection" />

        <div className="py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Connexion requise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous devez être connecté pour accéder à votre collection Pokémon.
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
      <Header title="Ma Collection" />

      {/* Filtres et actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdateAllPrices} disabled={isUpdatingPrices} variant="outline">
              {isUpdatingPrices ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Mettre à jour les prix
                </>
              )}
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Link href="/ajouter">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="booster-pack">🎴 Booster</SelectItem>
              <SelectItem value="booster-box">📦 Bundle</SelectItem>
              <SelectItem value="etb">🎁 Boîte d'Entraînement</SelectItem>
              <SelectItem value="coffret">📦 Coffret</SelectItem>
              <SelectItem value="single-card">🃏 Carte Individuelle</SelectItem>
              <SelectItem value="autre">📋 Autre</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les langues</SelectItem>
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <SelectItem key={key} value={key}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date d'achat</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="price">Prix d'achat</SelectItem>
              <SelectItem value="value">Valeur estimée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Collection */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {items.length === 0 ? "Votre collection est vide" : "Aucun objet trouvé"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {items.length === 0
              ? "Commencez par ajouter votre premier objet à votre collection."
              : "Essayez de modifier vos filtres de recherche."}
          </p>
          {items.length === 0 && (
            <Link href="/ajouter">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un objet
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <CollectionCard key={item.id} item={item} onDelete={handleDelete} onEdit={() => {}} />
          ))}
        </div>
      )}

      {/* Statistiques */}
      {items.length > 0 && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total :</span>
              <span className="ml-2 font-medium">{items.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Disponible :</span>
              <span className="ml-2 font-medium">{items.filter((i) => !i.isSold).length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vendu :</span>
              <span className="ml-2 font-medium">{items.filter((i) => i.isSold).length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valeur totale :</span>
              <span className="ml-2 font-medium">
                {items.reduce((sum, item) => sum + item.estimatedValue, 0).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

