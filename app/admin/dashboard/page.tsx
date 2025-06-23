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

interface Payment {
  id: string
  userId: string
  amount: number
  method: string
  status: "pending" | "completed" | "failed"
  date: string
  userEmail: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
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

    // Charger les paiements (simulation)
    const mockPayments: Payment[] = [
      {
        id: "1",
        userId: "user1",
        amount: 9.99,
        method: "card",
        status: "completed",
        date: new Date().toISOString(),
        userEmail: "user1@example.com"
      },
      {
        id: "2",
        userId: "user2",
        amount: 9.99,
        method: "paypal",
        status: "pending",
        date: new Date(Date.now() - 86400000).toISOString(),
        userEmail: "user2@example.com"
      }
    ]
    setPayments(mockPayments)

    // Calculer les statistiques
    const premiumUsers = allUsers.filter(u => u.plan === "premium").length
    const completedPayments = mockPayments.filter(p => p.status === "completed")
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const monthlyRevenue = completedPayments
      .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.amount, 0)

    setStats({
      totalUsers: allUsers.length,
      premiumUsers,
      freeUsers: allUsers.length - premiumUsers,
      totalRevenue,
      monthlyRevenue,
      pendingPayments: mockPayments.filter(p => p.status === "pending").length
    })
  }

  const handleUserAction = (userId: string, action: string) => {
    const users = AuthService.getUsers()
    const user = users[userId]
    
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

  const handlePaymentAction = (paymentId: string, action: string) => {
    const updatedPayments = payments.map(p => {
      if (p.id === paymentId) {
        if (action === "approve") {
          p.status = "completed"
        } else if (action === "reject") {
          p.status = "failed"
        }
      }
      return p
    })
    setPayments(updatedPayments)
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
        <Button onClick={() => router.push('/')}>
          Retour à l'app
        </Button>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyRevenue.toFixed(2)}€ ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Gratuit vers Premium
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de gestion */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.plan === "premium" ? "default" : "secondary"}>
                        {user.plan === "premium" ? "Premium" : "Gratuit"}
                      </Badge>
                      <div className="flex gap-1">
                        {user.plan === "free" && (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, "upgrade")}
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        )}
                        {user.plan === "premium" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "downgrade")}
                          >
                            Downgrade
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserAction(user.id, "delete")}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.amount}€ - {payment.method}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          payment.status === "completed" ? "default" : 
                          payment.status === "pending" ? "secondary" : "destructive"
                        }
                      >
                        {payment.status === "completed" ? "Complété" : 
                         payment.status === "pending" ? "En attente" : "Échoué"}
                      </Badge>
                      {payment.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handlePaymentAction(payment.id, "approve")}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePaymentAction(payment.id, "reject")}
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics et rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Croissance des utilisateurs</h3>
                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground ml-2">Graphique en cours</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Revenus mensuels</h3>
                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground ml-2">Graphique en cours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Prix du plan Premium</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label>Prix mensuel (€)</Label>
                      <Input type="number" defaultValue="9.99" className="w-32" />
                    </div>
                    <div>
                      <Label>Prix annuel (€)</Label>
                      <Input type="number" defaultValue="99" className="w-32" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Limites du plan gratuit</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label>Nombre max d'objets</Label>
                      <Input type="number" defaultValue="20" className="w-32" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Maintenance</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Mode maintenance
                    </Button>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Sauvegarder les données
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 