"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle
} from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  userId: string
  userEmail: string
  username: string
  amount: number
  method: "card" | "paypal" | "apple" | "google"
  status: "pending" | "completed" | "failed" | "refunded"
  date: string
  transactionId?: string
  notes?: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push('/auth')
      return
    }

    loadPayments()
  }, [router])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, methodFilter])

  const loadPayments = () => {
    // Simuler des données de paiement
    const mockPayments: Payment[] = [
      {
        id: "1",
        userId: "user1",
        userEmail: "mathis@example.com",
        username: "Mathis",
        amount: 9.99,
        method: "card",
        status: "completed",
        date: new Date().toISOString(),
        transactionId: "TXN_001",
        notes: "Paiement automatique"
      },
      {
        id: "2",
        userId: "user2",
        userEmail: "user2@example.com",
        username: "User2",
        amount: 9.99,
        method: "paypal",
        status: "pending",
        date: new Date(Date.now() - 86400000).toISOString(),
        notes: "En attente de validation"
      },
      {
        id: "3",
        userId: "user3",
        userEmail: "user3@example.com",
        username: "User3",
        amount: 9.99,
        method: "apple",
        status: "failed",
        date: new Date(Date.now() - 172800000).toISOString(),
        notes: "Carte refusée"
      },
      {
        id: "4",
        userId: "user4",
        userEmail: "user4@example.com",
        username: "User4",
        amount: 99.00,
        method: "card",
        status: "completed",
        date: new Date(Date.now() - 259200000).toISOString(),
        transactionId: "TXN_004",
        notes: "Paiement annuel"
      }
    ]
    setPayments(mockPayments)
  }

  const filterPayments = () => {
    let filtered = payments

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Filtre par méthode
    if (methodFilter !== "all") {
      filtered = filtered.filter(payment => payment.method === methodFilter)
    }

    setFilteredPayments(filtered)
  }

  const handlePaymentAction = (paymentId: string, action: string) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        switch (action) {
          case "approve":
            return { ...payment, status: "completed" as const }
          case "reject":
            return { ...payment, status: "failed" as const }
          case "refund":
            return { ...payment, status: "refunded" as const }
          default:
            return payment
        }
      }
      return payment
    })
    setPayments(updatedPayments)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "refunded":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline"
    } as const

    const labels = {
      completed: "Complété",
      pending: "En attente",
      failed: "Échoué",
      refunded: "Remboursé"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "paypal":
        return <DollarSign className="h-4 w-4" />
      case "apple":
        return <CreditCard className="h-4 w-4" />
      case "google":
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const exportPayments = () => {
    const csvContent = [
      "ID,Email,Utilisateur,Montant,Méthode,Statut,Date,Transaction ID,Notes",
      ...filteredPayments.map(p => 
        `${p.id},${p.userEmail},${p.username},${p.amount},${p.method},${p.status},${p.date},${p.transactionId || ""},${p.notes || ""}`
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (!AuthService.isAdmin()) {
    return <div>Accès non autorisé</div>
  }

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
          <p className="text-muted-foreground">Administration des transactions et abonnements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
            Tableau de bord
          </Button>
          <Button onClick={() => router.push('/')}>
            Retour à l'app
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === "completed").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAmount.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === "pending").length} paiements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0 ? ((payments.filter(p => p.status === "completed").length / payments.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Paiements réussis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Email, utilisateur, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Complétés</SelectItem>
                  <SelectItem value="failed">Échoués</SelectItem>
                  <SelectItem value="refunded">Remboursés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Méthode</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="card">Carte</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple">Apple Pay</SelectItem>
                  <SelectItem value="google">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={exportPayments}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-medium">{payment.userEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.username} • {payment.amount}€ • {getMethodIcon(payment.method)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString()}
                      {payment.transactionId && ` • ${payment.transactionId}`}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(payment.status)}
                  <div className="flex gap-1">
                    {payment.status === "pending" && (
                      <>
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
                      </>
                    )}
                    {payment.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePaymentAction(payment.id, "refund")}
                      >
                        Rembourser
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 