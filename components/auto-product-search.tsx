"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Check, Loader2, ExternalLink, Zap } from "lucide-react"
import { CardMarketSearch, type CardMarketProduct } from "@/lib/cardmarket-search"
import { GoogleImagesService } from "@/lib/google-images"
import { formatCurrency } from "@/lib/utils"

interface AutoProductSearchProps {
  onProductSelect: (product: CardMarketProduct, image: string) => void
}

export function AutoProductSearch({ onProductSelect }: AutoProductSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<CardMarketProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CardMarketProduct | null>(null)
  const [productImage, setProductImage] = useState<string>("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Recherche instantanée pour l'autocomplétion
  const searchInstant = useCallback((searchQuery: string) => {
    if (searchQuery.length > 1) {
      const instantResults = CardMarketSearch.searchInstant(searchQuery)
      setResults(instantResults.slice(0, 6))

      const searchSuggestions = CardMarketSearch.getSuggestions(searchQuery)
      setSuggestions(searchSuggestions)
      setShowSuggestions(searchSuggestions.length > 0)
    } else {
      setResults([])
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [])

  // Recherche complète avec délai
  const searchComplete = useCallback(async (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setIsSearching(true)
      try {
        const products = await CardMarketSearch.searchProduct(searchQuery)
        setResults(products)
      } catch (error) {
        console.error("Erreur de recherche:", error)
      } finally {
        setIsSearching(false)
      }
    }
  }, [])

  useEffect(() => {
    // Recherche instantanée immédiate
    searchInstant(query)

    // Recherche complète avec délai
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchComplete(query)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [query, searchInstant, searchComplete])

  const handleProductSelect = async (product: CardMarketProduct) => {
    setSelectedProduct(product)
    setQuery(product.name)
    setResults([])
    setShowSuggestions(false)

    // Rechercher automatiquement une image
    try {
      const image = await GoogleImagesService.getBestImage(product.name)
      setProductImage(image)
      onProductSelect(product, image)
    } catch (error) {
      console.error("Erreur de recherche d'image:", error)
      const fallbackImage = GoogleImagesService.generateImageUrl(product.name)
      setProductImage(fallbackImage)
      onProductSelect(product, fallbackImage)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche avec suggestions */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tapez n'importe comment : 'CHARIZARD EX', 'booster ecarlate', 'ETB'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
        )}

        {/* Suggestions d'autocomplétion */}
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
          <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">Exemples de recherche :</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Charizard ex", "ETB Écarlate", "Booster Paradoxe", "Tin Koraidon", "Deck Miraidon"].map((example) => (
              <Button key={example} variant="outline" size="sm" onClick={() => setQuery(example)} className="text-xs">
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de recherche */}
      {results.length > 0 && !selectedProduct && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <p className="text-sm text-muted-foreground">{results.length} résultat(s) trouvé(s)</p>
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
                        {product.type}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(product.price.trendPrice)}
                      </span>
                    </div>
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

      {/* Produit sélectionné */}
      {selectedProduct && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {productImage && (
                <img
                  src={productImage || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="w-20 h-20 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300">Produit trouvé !</span>
                </div>
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{selectedProduct.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Cote: {formatCurrency(selectedProduct.price.trendPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(selectedProduct.url, "_blank")}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Voir sur CardMarket
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

      {query.length > 2 && results.length === 0 && !isSearching && !selectedProduct && (
        <div className="text-center py-6 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun produit trouvé pour "{query}"</p>
          <p className="text-xs mt-1">Essayez : "Charizard", "ETB", "Booster Box", "Tin", "Deck"...</p>
        </div>
      )}
    </div>
  )
}
