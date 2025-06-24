"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Crown, 
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  AlertTriangle
} from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { LocalStorage } from "@/lib/storage"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  username: string
  plan: "free" | "premium"
  createdAt: string
  isAdmin?: boolean
}

interface StripePayment {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  receipt_email?: string
  payment_method_types: string[]
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push('/auth')
      return
    }
    loadData()
  }, [router])

  const loadData = () => {
    // Charger les utilisateurs
    const allUsers = Object.values(AuthService.getUsers())
    setUsers(allUsers)
    setStats({
      totalUsers: allUsers.length,
      premiumUsers: allUsers.filter(u => u.plan === "premium").length,
      freeUsers: allUsers.filter(u => u.plan === "free").length
    })
  }

  const handleUserAction = (userId: string, action: string) => {
    const users = AuthService.getUsers()
    const user = users[userId]
    if (!user) return
    if (action === "upgrade") {
      user.plan = "premium"
    } else if (action === "downgrade") {
      user.plan = "free"
    } else if (action === "delete") {
      if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
        delete users[userId]
      }
    }
    AuthService.saveUsers(users)
    loadData()
  }

  if (!AuthService.isAdmin()) {
    return <div>Accès non autorisé</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
          <p className="text-muted-foreground">Gestion de l'application Pokémon Collection</p>
        </div>
        <Button onClick={() => router.push('/')}>Retour à l'app</Button>
      </div>
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.premiumUsers} premium
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs premium</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.freeUsers} gratuits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs gratuits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.premiumUsers} premium
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Gestion des utilisateurs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
        <div className="space-y-4">
          {users.length === 0 && <div className="text-muted-foreground">Aucun utilisateur</div>}
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Inscrit le {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.plan === "premium" ? "default" : "secondary"}>
                  {user.plan === "premium" ? "Premium" : "Gratuit"}
                </Badge>
                <div className="flex gap-1">
                  {user.plan === "free" && (
                    <Button size="sm" onClick={() => handleUserAction(user.id, "upgrade")}>Upgrade</Button>
                  )}
                  {user.plan === "premium" && (
                    <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "downgrade")}>Downgrade</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, "delete")}>Supprimer</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 