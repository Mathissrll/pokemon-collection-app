import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET(req: NextRequest) {
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