"use client"

import type { PokemonItem } from "@/types/collection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { formatCurrency, getTypeLabel } from "@/lib/utils"
import { getLanguageLabel } from "@/lib/languages"

interface EditPreviewProps {
  original: PokemonItem
  modified: Partial<PokemonItem>
}

export function EditPreview({ original, modified }: EditPreviewProps) {
  const changes: Array<{ field: string; before: string; after: string }> = []

  // Détecter les changements
  if (modified.name && modified.name !== original.name) {
    changes.push({ field: "Nom", before: original.name, after: modified.name })
  }
  if (modified.type && modified.type !== original.type) {
    changes.push({ field: "Type", before: getTypeLabel(original.type), after: getTypeLabel(modified.type) })
  }
  if (modified.language && modified.language !== original.language) {
    changes.push({
      field: "Langue",
      before: getLanguageLabel(original.language),
      after: getLanguageLabel(modified.language),
    })
  }
  if (modified.purchasePrice && modified.purchasePrice !== original.purchasePrice) {
    changes.push({
      field: "Prix d'achat",
      before: formatCurrency(original.purchasePrice),
      after: formatCurrency(modified.purchasePrice),
    })
  }
  if (modified.estimatedValue && modified.estimatedValue !== original.estimatedValue) {
    changes.push({
      field: "Valeur estimée",
      before: formatCurrency(original.estimatedValue),
      after: formatCurrency(modified.estimatedValue),
    })
  }

  if (changes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Aperçu des modifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">
              {change.field}
            </Badge>
            <span className="text-muted-foreground">{change.before}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium">{change.after}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
