"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Smartphone, Users, Shield } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { CloudStorage } from "@/lib/cloud-storage"
import type { User } from "@/lib/auth-service"

export function SyncStats() {
  const [user, setUser] = useState<User | null>(null)
  const [syncStats, setSyncStats] = useState(CloudStorage.getSyncStats())

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
    setSyncStats(CloudStorage.getSyncStats())
  }, [])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Synchronisation Cloud
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-medium mb-1">Synchronisation désactivée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connectez-vous pour synchroniser votre collection sur tous vos appareils
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Smartphone className="h-3 w-3" />
                <span>Accès multi-appareils</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Sauvegarde sécurisée</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-3 w-3" />
                <span>Partage de collections</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Synchronisation Cloud
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Statut:</span>
          <Badge variant={syncStats.isOnline ? "default" : "destructive"}>
            {syncStats.isOnline ? "En ligne" : "Hors ligne"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Compte:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user.username}</span>
            <Badge variant={user.plan === "premium" ? "default" : "secondary"}>{user.plan}</Badge>
          </div>
        </div>

        {syncStats.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Dernière sync:</span>
            <span className="text-sm text-muted-foreground">{new Date(syncStats.lastSync).toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm">Synchronisation auto:</span>
          <Badge variant="outline">Activée</Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Vos données sont automatiquement sauvegardées</p>
          <p>✅ Synchronisation entre tous vos appareils</p>
          <p>✅ Partage de collections disponible</p>
        </div>
      </CardContent>
    </Card>
  )
}
