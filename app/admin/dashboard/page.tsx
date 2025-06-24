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
  const [payments, setPayments] = useState<StripePayment[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  })
  const [loadingPayments, setLoadingPayments] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!AuthService.isAdmin()) {
      router.push('/auth')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    // Charger les utilisateurs
    const allUsers = Object.values(AuthService.getUsers())
    setUsers(allUsers)

    // Charger les paiements Stripe
    setLoadingPayments(true)
    const res = await fetch('/api/admin/stripe-payments')
    const data = await res.json()
    setLoadingPayments(false)
    if (data.payments) {
      setPayments(data.payments)
      // Calculer les stats à partir des paiements Stripe
      const completedPayments = data.payments.filter((p: StripePayment) => p.status === "succeeded")
      const totalRevenue = completedPayments.reduce((sum: number, p: StripePayment) => sum + p.amount / 100, 0)
      const monthlyRevenue = completedPayments
        .filter((p: StripePayment) => new Date(p.created * 1000).getMonth() === new Date().getMonth())
        .reduce((sum: number, p: StripePayment) => sum + p.amount / 100, 0)
      setStats({
        totalUsers: allUsers.length,
        premiumUsers: allUsers.filter(u => u.plan === "premium").length,
        freeUsers: allUsers.filter(u => u.plan === "free").length,
        totalRevenue,
        monthlyRevenue,
        pendingPayments: data.payments.filter((p: StripePayment) => p.status === "requires_payment_method").length
      })
    }
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
      <Button onClick={loadData} disabled={loadingPayments} className="mb-4">
        {loadingPayments ? 'Chargement...' : 'Rafraîchir les paiements Stripe'}
      </Button>

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
            <CardTitle className="text-sm font-medium">Revenus Stripe</CardTitle>
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

      {/* Liste des paiements Stripe */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Paiements Stripe</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Montant</th>
                <th className="px-4 py-2 border">Devise</th>
                <th className="px-4 py-2 border">Statut</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Email reçu</th>
                <th className="px-4 py-2 border">Méthode</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4">Aucun paiement Stripe trouvé</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 border">{p.id}</td>
                  <td className="px-4 py-2 border">{(p.amount / 100).toFixed(2)}€</td>
                  <td className="px-4 py-2 border">{p.currency}</td>
                  <td className="px-4 py-2 border">{p.status}</td>
                  <td className="px-4 py-2 border">{new Date(p.created * 1000).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{p.receipt_email || '-'}</td>
                  <td className="px-4 py-2 border">{p.payment_method_types.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      <p className="font-medium">{payment.receipt_email || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.amount}€ - {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          payment.status === "succeeded" ? "default" : 
                          payment.status === "requires_payment_method" ? "secondary" : "destructive"
                        }
                      >
                        {payment.status === "succeeded" ? "Complété" : 
                         payment.status === "requires_payment_method" ? "En attente" : "Échoué"}
                      </Badge>
                      {payment.status === "requires_payment_method" && (
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