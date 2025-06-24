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
import Papa from "papaparse"
import type { ParseResult } from "papaparse"

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<number>(1)

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

  const handleEditQuantity = (item: PokemonItem) => {
    setEditingId(item.id)
    setEditingQuantity(item.quantity || 1)
  }

  const handleSaveQuantity = (item: PokemonItem) => {
    if (editingQuantity < 1) return
    LocalStorage.updateItem(item.id, { quantity: editingQuantity })
    setEditingId(null)
    toast({
      title: "Quantité modifiée",
      description: `Nouvelle quantité : ${editingQuantity} pour ${item.name}`,
    })
    loadCollection()
  }

  // Import CSV
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<any>) => {
        let count = 0
        let ignored = 0
        if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
          toast({
            title: "Erreur d'import",
            description: "Le fichier est vide ou mal formaté.",
            variant: "destructive",
          })
          return
        }
        for (const row of results.data as any[]) {
          if (!row.Nom) {
            ignored++
            continue
          }
          try {
            const itemData = {
              name: row.Nom,
              type: row.Type || "autre",
              language: row.Langue || "francais",
              purchaseDate: row["Date d'achat"] || new Date().toISOString().split("T")[0],
              purchasePrice: parseFloat(row["Prix d'achat"] || "0"),
              estimatedValue: parseFloat(row["Valeur estimée"] || row["Prix d'achat"] || "0"),
              condition: "neuf" as const,
              photo: undefined,
              storageLocation: row.Localisation || "",
              notes: undefined,
              isSold: row.Statut === "Vendu",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              quantity: parseInt(row["Quantité"] || "1"),
            }
            await LocalStorage.addItem(itemData)
            count++
          } catch (err) {
            ignored++
            console.error("Erreur lors de l'import d'une ligne:", row, err)
          }
        }
        loadCollection()
        if (count === 0) {
          toast({
            title: "Aucun objet importé",
            description: ignored > 0 ? `${ignored} lignes ignorées (format ou champs manquants).` : "Vérifiez le format du fichier.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Import terminé",
            description: `${count} objets importés ou fusionnés dans la collection.` + (ignored > 0 ? ` (${ignored} lignes ignorées)` : ""),
            variant: ignored > 0 ? "default" : undefined,
          })
        }
      },
      error: (err) => {
        console.error("Erreur d'import CSV:", err)
        toast({
          title: "Erreur d'import",
          description: "Impossible de lire le fichier. Vérifiez le format.",
          variant: "destructive",
        })
      }
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
    <div className="min-h-screen bg-gray-50">
      <Header title="Ma Collection" />
      <main className="max-w-6xl mx-auto py-8 px-2">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56"
              />
              <Button variant="outline" onClick={loadCollection} title="Rafraîchir la collection">
                <RefreshCw size={18} />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="carte">Carte</SelectItem>
                  <SelectItem value="scellé">Scellé</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes langues</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
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
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button asChild>
              <Link href="/ajouter">
                <Plus className="mr-2 h-4 w-4" /> Ajouter
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExport} title="Exporter en CSV">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <label className="inline-block">
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              <Button variant="outline" asChild>
                <span><Download className="mr-2 h-4 w-4 rotate-180" />Importer</span>
              </Button>
            </label>
          </div>
        </div>

        {/* Tableau de collection */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Photo</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Qté</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Langue</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Prix d'achat</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Valeur estimée</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Statut</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <AlertCircle className="inline mr-2" />Aucun objet trouvé dans la collection.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                    onClick={() => window.location.href = `/collection/${item.id}` }
                  >
                    <td className="px-4 py-2">
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="w-12 h-12 object-cover rounded shadow" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                          <Package />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="px-4 py-2 text-center font-semibold text-gray-900 dark:text-gray-100" onClick={(e) => { e.stopPropagation(); handleEditQuantity(item) }} style={{ cursor: "pointer" }}>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={1}
                          value={editingQuantity}
                          autoFocus
                          onChange={e => setEditingQuantity(Math.max(1, Number(e.target.value)))}
                          onBlur={() => handleSaveQuantity(item)}
                          onKeyDown={e => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur() }}}
                          className="w-16 px-2 py-1 border rounded text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        (item.quantity || 1) > 1 ? (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-blue-600/10 text-blue-800 dark:bg-blue-400/20 dark:text-blue-200 font-semibold">
                            {item.quantity}
                          </span>
                        ) : (
                          1
                        )
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{LANGUAGES.find(l => l.code === item.language)?.name || item.language}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.purchasePrice ? item.purchasePrice.toFixed(2) + " €" : "-"}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.estimatedValue ? item.estimatedValue.toFixed(2) + " €" : "-"}</td>
                    <td className="px-4 py-2">
                      {item.isSold ? (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-red-600/10 text-red-800 dark:bg-red-400/20 dark:text-red-200">Vendu</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-green-600/10 text-green-800 dark:bg-green-400/20 dark:text-green-200">Disponible</span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); window.location.href = `/collection/${item.id}` }} title="Voir la fiche">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); /* TODO: édition inline */ }} title="Éditer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.788l-4 1 1-4 13.362-13.3z" />
                        </svg>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

