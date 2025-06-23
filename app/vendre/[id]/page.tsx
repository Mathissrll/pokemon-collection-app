"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, ArrowLeft, Save } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { PokemonItem } from "@/types/collection"
import { useToast } from "@/hooks/use-toast"

export default function VendrePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [item, setItem] = useState<PokemonItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saleData, setSaleData] = useState({
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: "",
    buyer: "",
    platform: "",
    notes: "",
    fees: "",
    shippingCost: "",
  })

  useEffect(() => {
    const itemId = resolvedParams.id as string
    const collection = LocalStorage.getCollection()
    const foundItem = collection.find((i) => i.id === itemId)

    if (foundItem) {
      setItem(foundItem)
      setSaleData((prev) => ({
        ...prev,
        salePrice: foundItem.estimatedValue.toString(),
      }))
    } else {
      toast({
        title: "Objet non trouvé",
        description: "L'objet que vous essayez de vendre n'existe pas.",
        variant: "destructive",
      })
      router.push("/collection")
    }
  }, [resolvedParams.id, router, toast])

  const calculateProfit = () => {
    if (!item || !saleData.salePrice) return { profit: 0, percentage: 0, netProfit: 0 }

    const salePrice = Number.parseFloat(saleData.salePrice)
    const fees = Number.parseFloat(saleData.fees) || 0
    const shipping = Number.parseFloat(saleData.shippingCost) || 0
    const netSalePrice = salePrice - fees - shipping

    const profit = netSalePrice - item.purchasePrice
    const percentage = (profit / item.purchasePrice) * 100

    return {
      profit,
      percentage,
      netProfit: netSalePrice,
      grossProfit: salePrice - item.purchasePrice,
    }
  }

  const handleSale = async () => {
    if (!item || !saleData.salePrice) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prix de vente.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      LocalStorage.sellItem(item.id, {
        saleDate: saleData.saleDate,
        salePrice: Number.parseFloat(saleData.salePrice),
        buyer: saleData.buyer || undefined,
        platform: saleData.platform || undefined,
        notes: saleData.notes || undefined,
      })

      toast({
        title: "Vente enregistrée",
        description: `${item.name} a été marqué comme vendu !`,
      })

      router.push("/collection")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 max-w-md">
        <Header title="Vendre un objet" />
        <div className="py-6 text-center">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  const profitData = calculateProfit()

  return (
    <div className="container mx-auto px-4 max-w-md">
      <Header title="Vendre un objet" />

      <div className="py-6 space-y-6">
        {/* Bouton retour */}
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Informations de l'objet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Objet à vendre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.photo && (
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={item.photo || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {item.type}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Prix d'achat:</span>
                <div className="font-medium">{formatCurrency(item.purchasePrice)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Valeur estimée:</span>
                <div className="font-medium">{formatCurrency(item.estimatedValue)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date d'achat:</span>
                <div className="font-medium">{formatDate(item.purchaseDate)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">État:</span>
                <div className="font-medium">{item.condition}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de vente */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Prix de vente (€) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={saleData.salePrice}
                onChange={(e) => setSaleData((prev) => ({ ...prev, salePrice: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleDate">Date de vente</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleData.saleDate}
                onChange={(e) => setSaleData((prev) => ({ ...prev, saleDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Plateforme de vente</Label>
              <Select
                value={saleData.platform}
                onValueChange={(value) => setSaleData((prev) => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardmarket">CardMarket</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="leboncoin">Le Bon Coin</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
                  <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                  <SelectItem value="magasin">Magasin local</SelectItem>
                  <SelectItem value="prive">Vente privée</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer">Acheteur (optionnel)</Label>
              <Input
                id="buyer"
                placeholder="Nom ou pseudo de l'acheteur"
                value={saleData.buyer}
                onChange={(e) => setSaleData((prev) => ({ ...prev, buyer: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fees">Frais (€)</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleData.fees}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, fees: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCost">Frais de port (€)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleData.shippingCost}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, shippingCost: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes sur la vente</Label>
              <Textarea
                id="notes"
                placeholder="Commentaires, conditions de vente..."
                value={saleData.notes}
                onChange={(e) => setSaleData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calcul du profit */}
        {saleData.salePrice && (
          <Card
            className={`border-2 ${profitData.profit >= 0 ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {profitData.profit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                Résultat de la vente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Prix de vente:</span>
                  <div className="font-medium">{formatCurrency(Number.parseFloat(saleData.salePrice))}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Prix d'achat:</span>
                  <div className="font-medium">{formatCurrency(item.purchasePrice)}</div>
                </div>
                {(saleData.fees || saleData.shippingCost) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Frais totaux:</span>
                      <div className="font-medium">
                        {formatCurrency(
                          (Number.parseFloat(saleData.fees) || 0) + (Number.parseFloat(saleData.shippingCost) || 0),
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vente nette:</span>
                      <div className="font-medium">{formatCurrency(profitData.netProfit)}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Profit/Perte:</span>
                  <div className={`text-lg font-bold ${profitData.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(profitData.profit)} ({profitData.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSale} disabled={isLoading || !saleData.salePrice} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Enregistrement..." : "Confirmer la vente"}
          </Button>
        </div>
      </div>
    </div>
  )
}
