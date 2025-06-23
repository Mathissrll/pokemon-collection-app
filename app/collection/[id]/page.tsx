"use client"

import { useEffect, useState } from 'react'
import { use } from 'react'
import { formatCurrency, formatDate, getConditionLabel } from '@/lib/utils'
import { ChartContainer } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LocalStorage } from '@/lib/storage'
import { AuthService } from '@/lib/auth-service'
import { PaymentModal } from '@/components/payment-modal'

export default function CollectionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()
  const resolvedParams = use(params)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier si l'utilisateur est connecté
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        setIsLoading(false)
        return
      }

      const collection = LocalStorage.getCollection()
      const foundItem = collection.find((i: any) => i.id === resolvedParams.id) || null
      
      // Ajouter des données de test temporaires pour la cote eBay
      if (foundItem) {
        const basePrice = 100 // Prix de base autour de 100€
        const variations = [0.85, 0.92, 0.98, 1.05, 1.12, 0.89, 1.08, 0.95, 1.03, 0.97, 1.06, 0.91, 1.04, 0.96, 1.09]
        
        // Générer un historique de cote sur les 30 derniers jours
        const historiqueCote = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const variation = variations[i % variations.length]
          const prix = Math.round(basePrice * variation * 100) / 100
          historiqueCote.push({
            date: date.toISOString(),
            valeur: prix
          })
        }
        
        // Mettre à jour l'item avec les données de test
        foundItem.coteActuelle = Math.round(basePrice * 1.02 * 100) / 100 // Cote actuelle légèrement au-dessus
        foundItem.historiqueCote = historiqueCote
        
        setItem(foundItem)
      } else {
        setItem(null)
      }
      setIsLoading(false)
    }
  }, [resolvedParams.id])

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      LocalStorage.deleteItem(resolvedParams.id)
      router.push('/collection')
    }
  }

  const handleEdit = () => {
    router.push(`/ajouter?edit=${resolvedParams.id}`)
  }

  const handleSell = () => {
    router.push(`/vendre/${resolvedParams.id}`)
  }

  const handlePaymentSuccess = () => {
    // Recharger la page pour afficher les nouvelles fonctionnalités
    window.location.reload()
  }

  // Vérifier si l'utilisateur est connecté
  const currentUser = AuthService.getCurrentUser()
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Link href="/collection" className="text-blue-600 text-xs">← Retour à la collection</Link>
        <div className="mt-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Connexion requise</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vous devez être connecté pour voir les détails de cet objet.
          </p>
          <Button onClick={() => router.push('/auth')}>
            Se connecter
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>

  if (!item) return (
    <div className="max-w-md mx-auto p-4">
      <Link href="/collection" className="text-blue-600 text-xs">← Retour à la collection</Link>
      <div className="mt-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Objet non trouvé</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          L'objet que vous recherchez n'existe pas ou n'appartient pas à votre collection.
        </p>
        <Button onClick={() => router.push('/collection')}>
          Retour à la collection
        </Button>
      </div>
    </div>
  )

  return (
    <>
    <div className="max-w-md mx-auto p-4">
      <Link href="/collection" className="text-blue-600 text-xs">← Retour à la collection</Link>
      <div className="mt-4 flex flex-col items-center">
        <h1 className="mt-4 text-lg font-bold text-center">{item.name}</h1>
        <div className="w-full max-w-64 aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg mt-4 overflow-hidden">
          <img
            src={item.photo || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        </div>
        <div className="w-full mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="font-bold">Langue :</span><span>{item.language}</span></div>
          <div className="flex justify-between"><span className="font-bold">État :</span><span>{getConditionLabel(item.condition)}</span></div>
          <div className="flex justify-between"><span className="font-bold">Date d'achat :</span><span>{formatDate(item.purchaseDate)}</span></div>
          <div className="flex justify-between"><span className="font-bold">Prix d'achat :</span><span>{formatCurrency(item.purchasePrice)}</span></div>
          <div className="flex justify-between"><span className="font-bold">Valeur estimée :</span><span>{formatCurrency(item.estimatedValue)}</span></div>
          {item.coteActuelle && currentUser.plan === "premium" && (
            <div className="flex justify-between"><span className="font-bold">Cote eBay :</span><span className="text-blue-700 dark:text-blue-300 font-semibold">{formatCurrency(item.coteActuelle)}</span></div>
          )}
          {item.storageLocation && (
            <div className="flex justify-between"><span className="font-bold">Lieu de stockage :</span><span>{item.storageLocation}</span></div>
          )}
          {item.notes && (
            <div className="flex justify-between"><span className="font-bold">Notes :</span><span>{item.notes}</span></div>
          )}
          {item.isSold && (
            <div className="flex flex-col gap-1 mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-md w-full text-center">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">✅ Vendu</span>
              <span className="text-xs font-medium">{formatCurrency(item.saleRecord?.salePrice || 0)}</span>
              {item.saleRecord && (
                <span className="text-xs text-muted-foreground">{formatDate(item.saleRecord.saleDate)}{item.saleRecord.platform && ` • ${item.saleRecord.platform}`}</span>
              )}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        {!item.isSold && (
          <div className="flex gap-2 mt-6 w-full">
            <Button onClick={handleEdit} variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button onClick={handleSell} variant="outline" className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Vendre
            </Button>
            <Button onClick={handleDelete} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}

        {item.isSold && (
          <div className="flex gap-2 mt-6 w-full">
            <Button onClick={handleEdit} variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button onClick={handleDelete} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}

        {Array.isArray(item.historiqueCote) && item.historiqueCote.length > 1 && currentUser.plan === "premium" && (
          <div className="mt-8 w-full">
            <div className="text-xs font-semibold mb-1 text-blue-700 dark:text-blue-300">Historique cote eBay (TEST)</div>
            <ChartContainer config={{ cote: { label: "Cote eBay", color: "#2563eb" } }}>
              {({ ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip }: any) => (
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={item.historiqueCote.map((h: any) => ({ ...h, date: h.date.slice(0, 10) }))}>
                    <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip />
                    <Line type="monotone" dataKey="valeur" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </div>
        )}

        {currentUser.plan === "free" && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-md text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              💎 Passez au plan Premium pour voir les cotes eBay en temps réel !
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs"
            >
              Passer au Premium
            </Button>
          </div>
        )}
      </div>
    </div>

    {/* Modal de paiement */}
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      onSuccess={handlePaymentSuccess}
    />
    </>
  )
} 