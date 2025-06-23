"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, AlertTriangle, Globe, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CardMarketBrowserProps {
  onPriceExtracted?: (price: number, productName: string) => void
}

export function CardMarketBrowser({ onPriceExtracted }: CardMarketBrowserProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUrl, setCurrentUrl] = useState("https://www.cardmarket.com/fr/Pokemon")
  const [canLoadIframe, setCanLoadIframe] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const searchUrl = `https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=${encodeURIComponent(
      searchQuery,
    )}`
    setCurrentUrl(searchUrl)
    setCanLoadIframe(true)
  }

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleIframeError = () => {
    setCanLoadIframe(false)
    toast({
      title: "⚠️ Intégration bloquée",
      description: "CardMarket bloque l'intégration. Ouverture dans un nouvel onglet...",
      variant: "destructive",
    })
    openInNewTab(currentUrl)
  }

  return (
    <div className="space-y-4">
      {/* Recherche CardMarket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Navigateur CardMarket intégré
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher un produit Pokémon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentUrl("https://www.cardmarket.com/fr/Pokemon/Products/Booster-Packs")
                setCanLoadIframe(true)
              }}
            >
              🎴 Boosters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentUrl("https://www.cardmarket.com/fr/Pokemon/Products/Sealed-Products")
                setCanLoadIframe(true)
              }}
            >
              📦 Produits scellés
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentUrl("https://www.cardmarket.com/fr/Pokemon/Products/Single-Cards")
                setCanLoadIframe(true)
              }}
            >
              🃏 Cartes seules
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement technique */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Limitations techniques</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                CardMarket bloque l'intégration iframe pour des raisons de sécurité. Si l'intégration échoue, le site
                s'ouvrira automatiquement dans un nouvel onglet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tentative d'intégration iframe */}
      {canLoadIframe && (
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">🌐 CardMarket</Badge>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{currentUrl}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => openInNewTab(currentUrl)}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ouvrir
                </Button>
              </div>

              <div className="relative">
                <iframe
                  src={currentUrl}
                  className="w-full h-[600px] border-0"
                  title="CardMarket"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onError={handleIframeError}
                  onLoad={() => {
                    // Vérifier si l'iframe a bien chargé
                    setTimeout(() => {
                      try {
                        const iframe = document.querySelector("iframe")
                        if (iframe && !iframe.contentDocument) {
                          handleIframeError()
                        }
                      } catch (e) {
                        handleIframeError()
                      }
                    }, 3000)
                  }}
                />

                {/* Overlay pour détecter les clics */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      className="pointer-events-auto"
                      onClick={() => {
                        // Simuler l'extraction de prix
                        const mockPrice = Math.random() * 50 + 5
                        const mockName = searchQuery || "Produit CardMarket"
                        onPriceExtracted?.(Math.round(mockPrice * 100) / 100, mockName)
                        toast({
                          title: "💰 Prix extrait !",
                          description: `Prix simulé: ${mockPrice.toFixed(2)}€`,
                        })
                      }}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Extraire prix
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liens rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">🔗 Liens rapides CardMarket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInNewTab("https://www.cardmarket.com/fr/Pokemon/Products/Booster-Packs")}
            >
              🎴 Boosters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInNewTab("https://www.cardmarket.com/fr/Pokemon/Products/Sealed-Products")}
            >
              📦 Scellés
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInNewTab("https://www.cardmarket.com/fr/Pokemon/Products/Single-Cards")}
            >
              🃏 Cartes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInNewTab("https://www.cardmarket.com/fr/Pokemon/Wants")}
            >
              💝 Wants
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
