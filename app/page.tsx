"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Euro } from "lucide-react"
import Link from "next/link"
import { LocalStorage } from "@/lib/storage"
import { calculateStats, formatCurrency } from "@/lib/utils"
import type { PokemonItem, CollectionStats } from "@/types/collection"

export default function HomePage() {
  const [stats, setStats] = useState<CollectionStats>({
    totalItems: 0,
    totalInvested: 0,
    totalEstimatedValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0,
  })
  const [recentItems, setRecentItems] = useState<PokemonItem[]>([])

  useEffect(() => {
    const collection = LocalStorage.getCollection()
    setStats(calculateStats(collection))
    setRecentItems(collection.slice(-3).reverse())
  }, [])

  return (
    <div className="container mx-auto px-4 max-w-md">
      <Header title="Collection Pokémon" />

      <div className="space-y-6 py-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Objets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Investi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plus/Moins-value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Plus/Moins-value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(stats.profitLoss)}
            </div>
            <div className={`text-sm ${stats.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.profitLossPercentage.toFixed(1)}% de variation
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild className="h-12">
              <Link href="/ajouter">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un objet
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12">
              <Link href="/collection">
                <Package className="h-4 w-4 mr-2" />
                Voir la collection
              </Link>
            </Button>
          </div>
        </div>

        {/* Objets récents */}
        {recentItems.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Ajouts récents</h2>
            <div className="space-y-2">
              {recentItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(item.estimatedValue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.purchasePrice)} d'achat
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {stats.totalItems === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Votre collection est vide</h3>
              <p className="text-muted-foreground mb-4">Commencez par ajouter votre premier objet Pokémon !</p>
              <Button asChild>
                <Link href="/ajouter">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un objet
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
