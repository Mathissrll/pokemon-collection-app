import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromApiRequest } from "@/lib/auth-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET(req: NextRequest) {
  const user = getUserFromApiRequest(req)
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
  }
  try {
    // On récupère les 50 derniers paiements Stripe (charges)
    const paymentIntents = await stripe.paymentIntents.list({ limit: 50 })
    // On retourne les infos utiles pour le dashboard
    const payments = paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
      receipt_email: pi.receipt_email,
      payment_method_types: pi.payment_method_types,
    }))
    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Erreur récupération paiements Stripe:', error)
    return NextResponse.json({ error: 'Erreur serveur Stripe' }, { status: 500 })
  }
} 