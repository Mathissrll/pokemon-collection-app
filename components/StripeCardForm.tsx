import React, { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface StripeCardFormProps {
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function StripeCardForm({ clientSecret, onSuccess, onError }: StripeCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    })
    setIsProcessing(false)
    if (result.error) {
      onError(result.error.message || "Erreur inconnue")
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      onSuccess()
    } else {
      onError("Le paiement n'a pas pu être confirmé.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement options={{ hidePostalCode: true }} className="p-2 border rounded" />
      <Button type="submit" disabled={isProcessing || !stripe} className="w-full">
        {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
        Payer
      </Button>
    </form>
  )
} 