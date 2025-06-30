import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromApiRequest } from "@/lib/auth-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  const user = getUserFromApiRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { paymentIntentId, paymentMethodId } = await request.json()

    // Validation
    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Confirmer le paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Enregistrer le paiement dans votre base de données
      // Mettre à jour le statut de l'utilisateur vers Premium
      console.log('Paiement réussi:', paymentIntent.id)
      
      return NextResponse.json({ 
        success: true,
        message: 'Paiement confirmé avec succès',
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Paiement échoué', status: paymentIntent.status },
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