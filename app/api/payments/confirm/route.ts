import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId } = await request.json()

    // Validation
    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // En production, utilisez Stripe :
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    })

    if (paymentIntent.status === 'succeeded') {
      // Enregistrer le paiement dans votre base de données
      // Mettre à jour le statut de l'utilisateur vers Premium
      
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Paiement échoué' },
        { status: 400 }
      )
    }
    */

    // Simulation pour la démo
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simuler un délai

    // Simuler un succès (90% de chance)
    const success = Math.random() > 0.1

    if (success) {
      // Enregistrer le paiement dans le localStorage pour la démo
      const payments = JSON.parse(localStorage.getItem('pokemon-payments') || '[]')
      payments.push({
        id: paymentIntentId,
        amount: 999, // 9.99€ en centimes
        status: 'completed',
        date: new Date().toISOString(),
        method: 'card',
      })
      localStorage.setItem('pokemon-payments', JSON.stringify(payments))

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Paiement refusé par la banque' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erreur confirmation paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 