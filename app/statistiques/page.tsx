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

export default function StatistiquesPage() {
  const [stats, setStats] = useState<CollectionStats>({
    totalItems: 0,
    totalInvested: 0,
    totalEstimatedValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0,
  })
  const [items, setItems] = useState<PokemonItem[]>([])
  const [typeStats, setTypeStats] = useState<Record<string, { count: number; value: number }>>({})
  const [monthlyStats, setMonthlyStats] = useState<Record<string, number>>({})
  const [chartData, setChartData] = useState<Array<{ month: string; invested: number; value: number; count: number }>>(
    [],
  )

  useEffect(() => {
    const collection = LocalStorage.getCollection()
    const extendedStats = calculateStats(collection)
    setStats(extendedStats)
    setItems(collection)
    calculateTypeStats(collection)
    calculateMonthlyStats(collection)
    setChartData(calculateChartData(collection))
  }, [])

  const calculateTypeStats = (collection: PokemonItem[]) => {
    const typeData: Record<string, { count: number; value: number }> = {}

    collection.forEach((item) => {
      if (!typeData[item.type]) {
        typeData[item.type] = { count: 0, value: 0 }
      }
      typeData[item.type].count++
      typeData[item.type].value += item.estimatedValue
    })

    setTypeStats(typeData)
  }

  const calculateMonthlyStats = (collection: PokemonItem[]) => {
    const monthlyData: Record<string, number> = {}

    collection.forEach((item) => {
      const month = new Date(item.purchaseDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })
      monthlyData[month] = (monthlyData[month] || 0) + item.purchasePrice
    })

    setMonthlyStats(monthlyData)
  }

  const calculateChartData = (collection: PokemonItem[]) => {
    const monthlyData: Record<string, { invested: number; value: number; count: number }> = {}

    collection.forEach((item) => {
      const month = new Date(item.purchaseDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
      })

      if (!monthlyData[month]) {
        monthlyData[month] = { invested: 0, value: 0, count: 0 }
      }

      monthlyData[month].invested += item.purchasePrice
      monthlyData[month].value += item.estimatedValue
      monthlyData[month].count++
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-12) // 12 derniers mois
      .map(([month, data]) => ({
        month,
        invested: data.invested,
        value: data.value,
        count: data.count,
      }))
  }

  const topPerformers = items
    .map((item) => ({
      ...item,
      profitLoss: item.estimatedValue - item.purchasePrice,
      profitLossPercentage: ((item.estimatedValue - item.purchasePrice) / item.purchasePrice) * 100,
    }))
    .sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)
    .slice(0, 3)

  return (
    <div className="container mx-auto px-4 max-w-md">
      <Header title="Statistiques" />

      <div className="py-6 space-y-6">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total objets
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
              <div className="text-xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance globale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.profitLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Performance globale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Valeur estimée:</span>
              <span className="font-bold">{formatCurrency(stats.totalEstimatedValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Plus/Moins-value:</span>
              <span className={`font-bold ${stats.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(stats.profitLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Variation:</span>
              <span className={`font-bold ${stats.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.profitLossPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.max(0, Math.min(100, 50 + stats.profitLossPercentage))} className="h-2" />
          </CardContent>
        </Card>

        {/* Graphique d'évolution */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution de la collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  invested: {
                    label: "Investi",
                    color: "hsl(var(--chart-1))",
                  },
                  value: {
                    label: "Valeur",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      stroke="var(--color-invested)"
                      name="Investi (€)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      name="Valeur (€)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Nouvelles statistiques de vente */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Vendus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSold || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                CA Réalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(stats.totalSalesRevenue || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Profit réalisé */}
        {stats.realizedProfitLoss !== undefined && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Profit Réalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.realizedProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(stats.realizedProfitLoss)}
              </div>
              <div className="text-sm text-muted-foreground">Sur les ventes effectuées</div>
            </CardContent>
          </Card>
        )}

        {/* Répartition par catégorie */}
        <CategoryStats items={items} totalValue={stats.totalEstimatedValue} />

        {/* Répartition par langue */}
        <LanguageStats items={items} totalValue={stats.totalEstimatedValue} />

        {/* Statistiques des photos */}
        <PhotoStats items={items} />

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

        {/* Achats mensuels */}
        {Object.keys(monthlyStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Achats par mois
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(monthlyStats)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .slice(-6)
                .map(([month, amount]) => {
                  const percentage = (amount / Math.max(...Object.values(monthlyStats))) * 100
                  return (
                    <div key={month} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{month}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        )}

        {stats.totalItems === 0 && (
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
