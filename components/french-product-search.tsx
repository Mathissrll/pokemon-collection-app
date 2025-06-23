"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Loader2, Package, Calendar } from "lucide-react"
import { PokemonProductsDatabase, type PokemonProduct } from "@/lib/pokemon-products-database"
import { AutoCardMarketService, type AutoProductResult } from "@/lib/auto-cardmarket-service"
import { formatCurrency } from "@/lib/utils"

interface FrenchProductSearchProps {
  onProductSelect: (result: AutoProductResult) => void
}

export function FrenchProductSearch({ onProductSelect }: FrenchProductSearchProps) {
  const [query, setQuery] = useState("")
  const [isLoadingCardMarket, setIsLoadingCardMarket] = useState<string | null>(null)
  const [results, setResults] = useState<PokemonProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Recherche instantanée
  useEffect(() => {
    if (query.length > 1) {
      const products = PokemonProductsDatabase.searchProducts(query)
      setResults(products)

      const searchSuggestions = PokemonProductsDatabase.getSuggestions(query)
      setSuggestions(searchSuggestions)
      setShowSuggestions(searchSuggestions.length > 0)
    } else {
      setResults([])
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const handleProductSelect = async (product: PokemonProduct) => {
    setIsLoadingCardMarket(product.id)

    try {
      // Rechercher automatiquement sur CardMarket
      const result = await AutoCardMarketService.searchProductOnCardMarket(product)
      onProductSelect(result)
      setQuery("")
      setResults([])
      setShowSuggestions(false)
    } catch (error) {
      console.error("Erreur lors de la recherche CardMarket:", error)
    } finally {
      setIsLoadingCardMarket(null)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      etb: "ETB",
      "booster-box": "Booster Box",
      "booster-pack": "Booster",
      tin: "Tin",
      "collection-box": "Collection",
      "premium-collection": "Premium",
      coffret: "Coffret",
      display: "Display",
      "deck-preconstruit": "Deck",
      "battle-deck": "Battle Deck",
      "theme-deck": "Theme Deck",
      "starter-deck": "Starter",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Recherchez un produit français : ETB, Booster Box, Tin..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10"
        />

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Exemples de recherche */}
      {query.length === 0 && (
        <div className="text-center py-4">
          <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">🇫🇷 Produits français uniquement</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "ETB Écarlate",
              "Booster Box Célébrations",
              "Tin Charizard",
              "Collection Premium",
              "Paradoxe Temporel",
              "Destinées Paldéennes",
            ].map((example) => (
              <Button key={example} variant="outline" size="sm" onClick={() => setQuery(example)} className="text-xs">
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de recherche */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <p className="text-sm text-muted-foreground">🇫🇷 {results.length} produit(s) français trouvé(s)</p>
          {results.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleProductSelect(product)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(product.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.series}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {product.releaseYear}
                      </span>
                      <span className="text-xs">🇫🇷</span>
                    </div>
                    {product.estimatedPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        ~{formatCurrency(product.estimatedPrice)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" disabled={isLoadingCardMarket === product.id}>
                    {isLoadingCardMarket === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aucun résultat */}
      {query.length > 2 && results.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun produit français trouvé pour "{query}"</p>
          <p className="text-xs mt-1">Essayez : "ETB", "Booster Box", "Tin", "Célébrations"...</p>
        </div>
      )}
    </div>
  )
}
