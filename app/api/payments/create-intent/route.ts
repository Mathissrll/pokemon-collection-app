import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromApiRequest } from "@/lib/auth-service"

// En production, installez Stripe : npm install stripe

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  const user = getUserFromApiRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  try {
    const { amount, currency = 'eur' } = await request.json()

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    // Créer une vraie intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Déjà en centimes
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        plan: 'premium',
        userId: user.id, // Utilise le vrai userId
      },
    })

    return NextResponse.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Erreur création intention de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 