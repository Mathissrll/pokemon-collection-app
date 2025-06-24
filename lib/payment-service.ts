// Service de paiement avec Stripe
// Note: En production, vous devrez configurer Stripe avec vos vraies clés

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

export class PaymentService {
  private static readonly STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
  private static readonly STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...'
  private static readonly WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'

  // Créer une intention de paiement
  static async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // On envoie le montant directement, sans multiplier par 100
          currency,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur PaymentService:', error)
      throw error
    }
  }

  // Confirmer un paiement
  static async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la confirmation du paiement')
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Erreur confirmation paiement:', error)
      return false
    }
  }

  // Créer un abonnement récurrent
  static async createSubscription(customerId: string, priceId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'abonnement')
      }

      const result = await response.json()
      return result.subscriptionId
    } catch (error) {
      console.error('Erreur création abonnement:', error)
      return null
    }
  }

  // Annuler un abonnement
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de l\'abonnement')
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Erreur annulation abonnement:', error)
      return false
    }
  }

  // Récupérer l'historique des paiements
  static async getPaymentHistory(customerId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/payments/history?customerId=${customerId}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur historique paiements:', error)
      return []
    }
  }

  // Créer un client Stripe
  static async createCustomer(email: string, name: string): Promise<string | null> {
    try {
      const response = await fetch('/api/payments/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du client')
      }

      const result = await response.json()
      return result.customerId
    } catch (error) {
      console.error('Erreur création client:', error)
      return null
    }
  }

  // Simuler un paiement réussi (pour les tests)
  static async simulateSuccessfulPayment(amount: number): Promise<boolean> {
    // Simulation d'un paiement réussi
    await new Promise(resolve => setTimeout(resolve, 2000))
    return Math.random() > 0.1 // 90% de chance de succès
  }
} 