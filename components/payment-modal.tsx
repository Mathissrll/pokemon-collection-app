"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Apple, Shield, CheckCircle, Loader2, CreditCardIcon, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PaymentService } from "@/lib/payment-service"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import StripeCardForm from "@/components/StripeCardForm"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type PaymentMethod = "card" | "paypal" | "apple" | "google"

interface PaymentData {
  method: PaymentMethod
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardholderName: string
  email: string
}

const PAYMENT_METHODS = [
  {
    id: "card" as PaymentMethod,
    name: "Carte bancaire",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
  },
  {
    id: "paypal" as PaymentMethod,
    name: "PayPal",
    icon: CreditCardIcon,
    description: "Paiement sécurisé via PayPal",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
  },
  {
    id: "apple" as PaymentMethod,
    icon: Apple,
    name: "Apple Pay",
    description: "Paiement via Apple Pay",
    color: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
  },
  {
    id: "google" as PaymentMethod,
    icon: CreditCard,
    name: "Google Pay",
    description: "Paiement via Google Pay",
    color: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
  }
]

const PREMIUM_FEATURES = [
  "Objets illimités dans votre collection",
  "Photos automatiques pour tous vos objets",
  "Cotes eBay en temps réel",
  "Historique des cotes avec graphiques",
  "Synchronisation cloud automatique",
  "Support prioritaire"
]

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "card",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardholderName: "",
    email: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const [stripePayments, setStripePayments] = useState<any[]>([])
  const [loadingStripePayments, setLoadingStripePayments] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStripePayments()
    }
  }, [isOpen])

  const fetchStripePayments = async () => {
    setLoadingStripePayments(true)
    try {
      const res = await fetch('/api/admin/stripe-payments')
      const data = await res.json()
      setStripePayments(data.payments || [])
    } catch (e) {
      setStripePayments([])
    } finally {
      setLoadingStripePayments(false)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const paymentIntent = await PaymentService.createPaymentIntent(999, 'eur')
      setClientSecret(paymentIntent.client_secret)
      setIsProcessing(false)
    } catch (error) {
      setShowValidationModal(true)
      setValidationSuccess(false)
      setIsProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    setIsProcessing(true)
    
    try {
      // Redirection vers PayPal (en production)
      // window.location.href = paypalCheckoutUrl
      
      // Simulation pour la démo
      await new Promise(resolve => setTimeout(resolve, 2000))
      const success = Math.random() > 0.1
      
      if (success) {
        toast({
          title: "Paiement PayPal réussi !",
          description: "Votre compte a été mis à jour vers le plan Premium.",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Paiement PayPal refusé")
      }
    } catch (error) {
      toast({
        title: "Erreur PayPal",
        description: "Le paiement PayPal n'a pas pu être traité.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAppleGooglePay = async () => {
    setIsProcessing(true)
    
    try {
      // Intégration Apple Pay / Google Pay (en production)
      // const paymentRequest = new PaymentRequest(...)
      
      // Simulation pour la démo
      await new Promise(resolve => setTimeout(resolve, 1500))
      const success = Math.random() > 0.05 // 95% de succès pour Apple/Google Pay
      
      if (success) {
        toast({
          title: "Paiement réussi !",
          description: "Votre compte a été mis à jour vers le plan Premium.",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Paiement refusé")
      }
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Le paiement n'a pas pu être traité.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Passer au plan Premium
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Prix et fonctionnalités */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Plan Premium</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">9,99€</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PREMIUM_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Méthodes de paiement */}
            <div className="space-y-3">
              <Label>Méthode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : method.color
                    }`}
                    onClick={() => {
                      setSelectedMethod(method.id)
                      setPaymentData(prev => ({ ...prev, method: method.id }))
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire de paiement */}
            {selectedMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      cardNumber: formatCardNumber(e.target.value)
                    }))}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Date d'expiration</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/AA"
                      value={paymentData.cardExpiry}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardExpiry: formatExpiry(e.target.value)
                      }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      value={paymentData.cardCvc}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardCvc: e.target.value.replace(/\D/g, '')
                      }))}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Nom du titulaire</Label>
                  <Input
                    id="cardholderName"
                    placeholder="Jean Dupont"
                    value={paymentData.cardholderName}
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      cardholderName: e.target.value
                    }))}
                  />
                </div>
              </div>
            )}

            {selectedMethod === "paypal" && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Vous serez redirigé vers PayPal pour finaliser votre paiement.
                </p>
                <Button variant="outline" className="w-full">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Continuer avec PayPal
                </Button>
              </div>
            )}

            {(selectedMethod === "apple" || selectedMethod === "google") && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Utilisez votre {selectedMethod === "apple" ? "Apple Pay" : "Google Pay"} pour payer.
                </p>
                <Button variant="outline" className="w-full">
                  <Apple className="h-4 w-4 mr-2" />
                  Payer avec {selectedMethod === "apple" ? "Apple Pay" : "Google Pay"}
                </Button>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              {!clientSecret ? (
                <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
                  {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Payer 9,99€
                </Button>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCardForm
                    clientSecret={clientSecret}
                    onSuccess={() => {
                      setShowValidationModal(true)
                      setValidationSuccess(true)
                      setTimeout(() => {
                        setShowValidationModal(false)
                        setClientSecret(null)
                        onSuccess()
                        onClose()
                      }, 2000)
                    }}
                    onError={(err) => {
                      setShowValidationModal(true)
                      setValidationSuccess(false)
                    }}
                  />
                </Elements>
              )}
            </div>

            {/* Sécurité */}
            <div className="text-center text-xs text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              Paiement sécurisé par SSL - Vos données sont protégées
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de validation */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>
              {validationSuccess === true ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                  Paiement réussi !
                </div>
              ) : validationSuccess === false ? (
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-10 w-10 text-red-500 mx-auto" />
                  Paiement échoué
                </div>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {validationSuccess === true
              ? "Votre compte a été mis à jour vers le plan Premium. Merci !"
              : validationSuccess === false
                ? "Le paiement n'a pas pu être traité. Veuillez réessayer."
                : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 