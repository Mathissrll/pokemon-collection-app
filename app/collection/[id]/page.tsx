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
import { getMedianSoldPriceForItem } from '@/lib/ebay-sold-listings-service'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function CollectionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()
  const resolvedParams = use(params)
  const [ebayData, setEbayData] = useState<{ median: number, listings: any[] }|null>(null)
  const [ebayLoading, setEbayLoading] = useState(false)
  
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
      
      if (foundItem) {
        setItem(foundItem)
        // Appel à la vraie API eBay
        setEbayLoading(true)
        getMedianSoldPriceForItem(foundItem.name, foundItem.language).then(res => {
          setEbayData(res)
        }).finally(() => setEbayLoading(false))
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

        {/* Cote eBay réelle */}
        {currentUser.plan === "premium" && (
          <div className="mt-6 w-full">
            <div className="text-xs font-semibold mb-1 text-blue-700 dark:text-blue-300">Cote eBay (réelle)</div>
            {ebayLoading ? (
              <div className="text-gray-400 text-xs">Chargement de la cote eBay...</div>
            ) : ebayData && ebayData.median ? (
              <>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Prix médian :</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">{formatCurrency(ebayData.median)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{ebayData.listings.length} ventes analysées</div>
                {ebayData.listings.length > 0 && (
                  <div className="w-full h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ebayData.listings.slice(0, 10).reverse()} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="soldDate" tick={{ fontSize: 10 }} hide={false} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip formatter={(value) => `${value} €`} labelFormatter={d => `Date : ${d}`} />
                        <Line type="monotone" dataKey="soldPrice" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-xs">Aucune cote eBay trouvée</div>
            )}
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