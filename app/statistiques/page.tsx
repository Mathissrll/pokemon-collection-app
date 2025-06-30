"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Package, Euro, Calendar, DollarSign } from "lucide-react"
import { LocalStorage } from "@/lib/storage"
import { calculateStats, formatCurrency, getTypeLabel } from "@/lib/utils"
import type { PokemonItem, CollectionStats } from "@/types/collection"
import { CategoryStats } from "@/components/category-stats"
import { LanguageStats } from "@/components/language-stats"
import { PhotoStats } from "@/components/photo-stats"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ConfirmEmailPrompt } from "@/components/confirm-email-prompt"

export default function StatistiquesPage() {
  const [invested, setInvested] = useState(0)
  const [sold, setSold] = useState(0)
  const [items, setItems] = useState<PokemonItem[]>([])
  const [chartData, setChartData] = useState<Array<{ month: string; invested: number; sold: number; stock: number }>>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const collection = LocalStorage.getCollection()
    setItems(collection)
    setInvested(collection.reduce((sum, item) => sum + item.purchasePrice * (item.quantity || 1), 0))
    setSold(collection.filter(i => i.isSold).reduce((sum, item) => sum + (item.saleRecord?.salePrice || 0), 0))
    setChartData(generateChartData(collection))
  }, [])

  useEffect(() => {
    const user = LocalStorage.getCurrentUser()
    setUser(user)
  }, [])

  // Générer les données pour les graphiques
  function generateChartData(collection: PokemonItem[]) {
    // Grouper par mois d'achat
    const monthly: Record<string, { invested: number; sold: number; stock: number }> = {}
    let stock = 0
    collection.forEach((item) => {
      const month = new Date(item.purchaseDate).toLocaleDateString("fr-FR", { year: "numeric", month: "short" })
      if (!monthly[month]) monthly[month] = { invested: 0, sold: 0, stock: 0 }
      monthly[month].invested += item.purchasePrice * (item.quantity || 1)
      if (item.isSold) monthly[month].sold += item.saleRecord?.salePrice || 0
    })
    // Calculer le stock cumulé
    let runningStock = 0
    Object.keys(monthly).sort().forEach(month => {
      runningStock += monthly[month].invested > 0 ? 1 : 0
      monthly[month].stock = runningStock
    })
    return Object.entries(monthly).map(([month, data]) => ({ month, ...data }))
  }

  const topPerformers = items
    .map((item) => ({
      ...item,
      profitLoss: item.estimatedValue - item.purchasePrice,
      profitLossPercentage: ((item.estimatedValue - item.purchasePrice) / item.purchasePrice) * 100,
    }))
    .sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)
    .slice(0, 3)

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

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <Header title="Statistiques" />
      <div className="py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Objets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.reduce((sum, item) => sum + (item.quantity || 1), 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Investissement total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(invested)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ventes totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sold)}</div>
            </CardContent>
          </Card>
        </div>
        {/* Graphique Investissement vs Ventes */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investissement vs Ventes (par mois)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ChartContainer
                config={{
                  invested: { label: "Investi", color: "#2563eb" },
                  sold: { label: "Vendu", color: "#22c55e" },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Line type="monotone" dataKey="invested" stroke="#2563eb" strokeWidth={2} />
                    <Line type="monotone" dataKey="sold" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
        {/* Graphique Evolution du stock */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Evolution du stock (par mois)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ChartContainer
                config={{ stock: { label: "Stock", color: "#f59e42" } }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Line type="monotone" dataKey="stock" stroke="#f59e42" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top performers */}
        {topPerformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Meilleures performances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{getTypeLabel(item.type)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      +{item.profitLossPercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(item.profitLoss)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {items.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Pas encore de statistiques</h3>
              <p className="text-muted-foreground">
                Ajoutez des objets à votre collection pour voir vos statistiques !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
