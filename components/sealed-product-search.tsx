"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Check, Loader2, ExternalLink, Package, Calendar } from "lucide-react"
import { PokemonProductsDatabase, type PokemonProduct } from "@/lib/pokemon-products-database"
import { AutoCardMarketService, type AutoProductResult } from "@/lib/auto-cardmarket-service"
import { formatCurrency } from "@/lib/utils"

interface SealedProductSearchProps {
  onProductSelect: (result: AutoProductResult) => void
}

export function SealedProductSearch({ onProductSelect }: SealedProductSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingCardMarket, setIsLoadingCardMarket] = useState(false)
  const [results, setResults] = useState<PokemonProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<AutoProductResult | null>(null)
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
    setIsLoadingCardMarket(true)
    setSelectedProduct(null)

    try {
      // Rechercher automatiquement sur CardMarket
      const result = await AutoCardMarketService.searchProductOnCardMarket(product)
      setSelectedProduct(result)
      onProductSelect(result)
      setQuery(product.name)
      setResults([])
      setShowSuggestions(false)
    } catch (error) {
      console.error("Erreur lors de la recherche CardMarket:", error)
    } finally {
      setIsLoadingCardMarket(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      etb: "Elite Trainer Box",
      "booster-box": "Booster Box",
      "booster-pack": "Booster Pack",
      tin: "Tin",
      "collection-box": "Collection Box",
      "premium-collection": "Premium Collection",
      coffret: "Coffret",
      display: "Display",
      "deck-preconstruit": "Deck Préconstruit",
      "battle-deck": "Battle Deck",
      "theme-deck": "Theme Deck",
      "starter-deck": "Starter Deck",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getLanguageFlag = (language: string) => {
    const flags = {
      francais: "🇫🇷",
      anglais: "🇺🇸",
      japonais: "🇯🇵",
    }
    return flags[language as keyof typeof flags] || "🌍"
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Recherchez parmi TOUS les produits scellés Pokémon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
        )}

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Base de données complète
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Recherchez parmi des centaines de produits scellés Pokémon !
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "ETB Écarlate",
                "Booster Box Célébrations",
                "Tin Charizard",
                "Collection Premium",
                "Hidden Fates",
                "VMAX Climax",
              ].map((example) => (
                <Button key={example} variant="outline" size="sm" onClick={() => setQuery(example)} className="text-xs">
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chargement CardMarket */}
      {isLoadingCardMarket && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Recherche sur CardMarket...</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Prix, images et informations en cours de récupération
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche */}
      {results.length > 0 && !selectedProduct && !isLoadingCardMarket && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <p className="text-sm text-muted-foreground">{results.length} produit(s) trouvé(s)</p>
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
                      <span className="text-xs">{getLanguageFlag(product.language)}</span>
                    </div>
                    {product.estimatedPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        ~{formatCurrency(product.estimatedPrice)}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Produit sélectionné avec données CardMarket */}
      {selectedProduct && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.product.name}
                  className="w-20 h-20 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Produit trouvé avec cote CardMarket !
                  </span>
                </div>
                <h3 className="font-semibold">{selectedProduct.product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{getTypeLabel(selectedProduct.product.type)}</Badge>
                  <Badge variant="secondary">{selectedProduct.product.series}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {getLanguageFlag(selectedProduct.product.language)} {selectedProduct.product.releaseYear}
                  </span>
                </div>
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                  <div className="flex justify-between">
                    <span>Cote CardMarket:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedProduct.cardMarketPrice.trendPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedProduct.cardMarketUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    CardMarket
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                    Changer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aucun résultat */}
      {query.length > 2 && results.length === 0 && !isLoadingCardMarket && !selectedProduct && (
        <div className="text-center py-6 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun produit trouvé pour "{query}"</p>
          <p className="text-xs mt-1">Essayez : "ETB", "Booster Box", "Tin", "Célébrations", "Hidden Fates"...</p>
        </div>
      )}
    </div>
  )
}
