import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Erreur de signature webhook:', err)
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
    }

    console.log('Événement webhook reçu:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Paiement réussi:', paymentIntent.id)
        
        // Mettre à jour le plan de l'utilisateur
        await handlePaymentSuccess(paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Paiement échoué:', failedPayment.id)
        
        // Gérer l'échec de paiement
        await handlePaymentFailure(failedPayment)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        console.log('Abonnement créé:', subscription.id)
        
        // Activer le plan premium
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Abonnement mis à jour:', updatedSubscription.id)
        
        // Mettre à jour le statut de l'abonnement
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Abonnement supprimé:', deletedSubscription.id)
        
        // Rétrograder vers le plan gratuit
        await handleSubscriptionDeleted(deletedSubscription)
        break

      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Récupérer les métadonnées du paiement
    const userId = paymentIntent.metadata.userId
    const plan = paymentIntent.metadata.plan

    if (userId && plan === 'premium') {
      // Mettre à jour le plan de l'utilisateur vers premium
      console.log(`Utilisateur ${userId} mis à jour vers le plan premium`)
      
      // Ici vous pourriez mettre à jour votre base de données
      // Pour l'instant, on simule avec localStorage
      if (typeof window !== 'undefined') {
        const users = JSON.parse(localStorage.getItem('pokemon-users') || '{}')
        if (users[userId]) {
          users[userId].plan = 'premium'
          localStorage.setItem('pokemon-users', JSON.stringify(users))
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error)
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId
    console.log(`Paiement échoué pour l'utilisateur ${userId}`)
    
    // Envoyer un email de notification ou mettre à jour le statut
    // Pour l'instant, on log juste l'erreur
  } catch (error) {
    console.error('Erreur lors du traitement de l\'échec de paiement:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId
    console.log(`Abonnement créé pour l'utilisateur ${userId}`)
    
    // Activer le plan premium
    if (userId) {
      // Mettre à jour la base de données
      console.log(`Utilisateur ${userId} abonné au plan premium`)
    }
  } catch (error) {
    console.error('Erreur lors de la création d\'abonnement:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId
    const status = subscription.status
    
    console.log(`Abonnement mis à jour pour l'utilisateur ${userId}: ${status}`)
    
    // Gérer les différents statuts d'abonnement
    if (status === 'active') {
      // Abonnement actif
    } else if (status === 'past_due') {
      // Paiement en retard
    } else if (status === 'canceled') {
      // Abonnement annulé
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'abonnement:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId
    console.log(`Abonnement supprimé pour l'utilisateur ${userId}`)
    
    // Rétrograder vers le plan gratuit
    if (userId) {
      // Mettre à jour la base de données
      console.log(`Utilisateur ${userId} rétrogradé vers le plan gratuit`)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression d\'abonnement:', error)
  }
} 