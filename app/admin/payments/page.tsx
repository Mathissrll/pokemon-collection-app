"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

interface StripePayment {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  receipt_email?: string
  payment_method_types: string[]
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<StripePayment[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push('/auth')
      return
    }
    fetchPayments()
  }, [router])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stripe-payments')
      const data = await res.json()
      setPayments(data.payments || [])
    } catch (e) {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  if (!AuthService.isAdmin()) {
    return <div>Accès non autorisé</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Gestion des paiements Stripe</h1>
        <Button onClick={fetchPayments} disabled={loading}>
          {loading ? 'Chargement...' : 'Rafraîchir'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Paiements Stripe (test ou live)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">ID</th>
                  <th className="px-2 py-1 border">Montant</th>
                  <th className="px-2 py-1 border">Statut</th>
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Email reçu</th>
                  <th className="px-2 py-1 border">Méthode</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-2">Aucun paiement Stripe</td></tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 py-1 border">{p.id}</td>
                    <td className="px-2 py-1 border">{(p.amount / 100).toFixed(2)}€</td>
                    <td className="px-2 py-1 border">{p.status}</td>
                    <td className="px-2 py-1 border">{new Date(p.created * 1000).toLocaleString()}</td>
                    <td className="px-2 py-1 border">{p.receipt_email || '-'}</td>
                    <td className="px-2 py-1 border">{p.payment_method_types.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 