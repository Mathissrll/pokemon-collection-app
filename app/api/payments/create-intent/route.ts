import { NextRequest, NextResponse } from 'next/server'

// En production, installez Stripe : npm install stripe
// import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'eur' } = await request.json()

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    // En production, utilisez Stripe :
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
    })
    */

    // Simulation pour la démo
    const mockPaymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
      client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
    }

    return NextResponse.json(mockPaymentIntent)
  } catch (error) {
    console.error('Erreur création intention de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 