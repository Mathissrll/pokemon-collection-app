"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { LocalStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { PaymentModal } from "./payment-modal"

export function PlanInfo() {
  const { toast } = useToast()
  const [user, setUser] = useState(AuthService.getCurrentUser())
  const [collection, setCollection] = useState<Array<any>>([])
  const [limits, setLimits] = useState<{ canAddItem: boolean; canAddPhoto: boolean; error?: string }>({
    canAddItem: true,
    canAddPhoto: true,
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      const userCollection = LocalStorage.getCollection()
      setCollection(userCollection)
      
      const planLimits = LocalStorage.checkPlanLimits()
      setLimits(planLimits)
    }
  }, [])

  const handlePaymentSuccess = () => {
    // Mettre à jour le plan de l'utilisateur
    if (user) {
      const updatedUser = { ...user, plan: "premium" as const }
      // Mettre à jour l'utilisateur dans le stockage
      const users = AuthService.getUsers()
      users[user.id] = updatedUser
      AuthService.saveUsers(users)
      
      // Mettre à jour l'état local
      setUser(updatedUser)
      
      // Recharger les limites
      const planLimits = LocalStorage.checkPlanLimits()
      setLimits(planLimits)
    }
  }

  if (!user) {
    return null
  }

  const isPremium = user.plan === "premium"
  const isAdmin = AuthService.isAdmin()
  const itemCount = collection.length
  const maxItems = isPremium || isAdmin ? "Illimité" : 20
  const itemUsage = isPremium || isAdmin ? 0 : (itemCount / 20) * 100

  const getPlanIcon = () => {
    if (isAdmin) return <Crown className="h-5 w-5 text-red-500" />
    if (isPremium) return <Crown className="h-5 w-5 text-yellow-500" />
    return <Shield className="h-5 w-5 text-blue-500" />
  }

  const getPlanBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-red-500 text-white"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    if (isPremium) {
      return <Badge className="bg-yellow-500 text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
    }
    return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Gratuit</Badge>
  }

  const handleUpgrade = () => {
    setShowPaymentModal(true)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon()}
          Votre Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan actuel */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan actuel</span>
          {getPlanBadge()}
        </div>

        {/* Utilisation des objets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Objets dans la collection</span>
            <span className="font-medium">
              {itemCount} / {maxItems}
            </span>
          </div>
          {!isPremium && !isAdmin && (
            <Progress value={itemUsage} className="h-2" />
          )}
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fonctionnalités</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              {isPremium || isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span>Objets illimités</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPremium || isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span>Photos des objets</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPremium || isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span>Sauvegarde cloud</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPremium || isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span>Export avancé</span>
            </div>
          </div>
        </div>

        {/* Bouton de mise à niveau */}
        {!isPremium && !isAdmin && (
          <Button onClick={handleUpgrade} className="w-full" variant="outline">
            <Crown className="h-4 w-4 mr-2" />
            Passer au Premium
          </Button>
        )}

        {/* Message d'information */}
        {!isPremium && !isAdmin && (
          <div className="text-xs text-muted-foreground text-center">
            Plan Premium : 9,99€/mois ou 99€/an
          </div>
        )}
      </CardContent>
    </Card>

    {/* Modal de paiement */}
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      onSuccess={handlePaymentSuccess}
    />
    </>
  )
} 