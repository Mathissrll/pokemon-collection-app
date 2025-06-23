"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudOff, RefreshCw, Share2, User } from "lucide-react"
import { CloudStorage } from "@/lib/cloud-storage"
import { AuthService, type User as AuthUser } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"

interface SyncStatusProps {
  onSync?: () => void
}

export function SyncStatus({ onSync }: SyncStatusProps) {
  const { toast } = useToast()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStats, setSyncStats] = useState(CloudStorage.getSyncStats())

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
    setSyncStats(CloudStorage.getSyncStats())

    // Mettre à jour les stats toutes les minutes
    const interval = setInterval(() => {
      setSyncStats(CloudStorage.getSyncStats())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      // Simuler la synchronisation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Synchronisation réussie",
        description: "Votre collection a été synchronisée avec le cloud.",
      })

      setSyncStats(CloudStorage.getSyncStats())
      onSync?.()
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec le cloud.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleShare = async () => {
    if (!user) return

    try {
      const shareCode = await CloudStorage.shareCollection(true)
      if (shareCode) {
        navigator.clipboard.writeText(shareCode)
        toast({
          title: "Collection partagée",
          description: `Code de partage copié: ${shareCode}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur de partage",
        description: "Impossible de partager la collection.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Non connecté</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">{user.username}</span>
        <Badge variant={user.plan === "premium" ? "default" : "secondary"}>{user.plan}</Badge>
      </div>

      <div className="flex items-center gap-1">
        {syncStats.isOnline ? (
          <Cloud className="h-4 w-4 text-green-600" />
        ) : (
          <CloudOff className="h-4 w-4 text-red-600" />
        )}

        <Button variant="ghost" size="sm" onClick={handleSync} disabled={isSyncing || !syncStats.isOnline}>
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {syncStats.lastSync && (
        <div className="text-xs text-muted-foreground">Sync: {new Date(syncStats.lastSync).toLocaleTimeString()}</div>
      )}
    </div>
  )
}
