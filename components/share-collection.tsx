"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Eye, Users } from "lucide-react"
import { CloudStorage } from "@/lib/cloud-storage"
import { useToast } from "@/hooks/use-toast"

interface ShareCollectionProps {
  children: React.ReactNode
}

export function ShareCollection({ children }: ShareCollectionProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [shareCode, setShareCode] = useState<string>("")
  const [isSharing, setIsSharing] = useState(false)
  const [accessCode, setAccessCode] = useState("")

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const code = await CloudStorage.shareCollection(true)
      if (code) {
        setShareCode(code)
        toast({
          title: "Collection partagée",
          description: "Votre collection est maintenant publique !",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de partager la collection.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareCode = () => {
    navigator.clipboard.writeText(shareCode)
    toast({
      title: "Code copié",
      description: "Le code de partage a été copié dans le presse-papiers.",
    })
  }

  const viewSharedCollection = () => {
    if (!accessCode) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir un code de partage.",
        variant: "destructive",
      })
      return
    }

    const collection = CloudStorage.getSharedCollection(accessCode)
    if (collection) {
      toast({
        title: "Collection trouvée",
        description: `Collection de ${collection.userId} avec ${collection.items.length} objets.`,
      })
      // Ici on pourrait ouvrir une nouvelle page ou modal pour afficher la collection
    } else {
      toast({
        title: "Collection non trouvée",
        description: "Code de partage invalide ou collection privée.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partager ma collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Partager sa collection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="font-medium">Rendre ma collection publique</h3>
            </div>

            {shareCode ? (
              <div className="space-y-2">
                <Label>Code de partage</Label>
                <div className="flex gap-2">
                  <Input value={shareCode} readOnly />
                  <Button variant="outline" size="icon" onClick={copyShareCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partagez ce code pour permettre aux autres de voir votre collection.
                </p>
              </div>
            ) : (
              <Button onClick={handleShare} disabled={isSharing} className="w-full">
                {isSharing ? "Partage en cours..." : "Générer un code de partage"}
              </Button>
            )}
          </div>

          <div className="border-t pt-4">
            {/* Voir une collection partagée */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h3 className="font-medium">Voir une collection partagée</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-code">Code de partage</Label>
                <Input
                  id="access-code"
                  placeholder="PKM-XXXXXXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                />
              </div>

              <Button variant="outline" onClick={viewSharedCollection} className="w-full">
                Voir la collection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
