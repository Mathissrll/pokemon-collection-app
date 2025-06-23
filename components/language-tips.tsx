"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb } from "lucide-react"
import { getMostValuableLanguages, getLanguagesByRarity } from "@/lib/languages"

export function LanguageTips() {
  const valuableLanguages = getMostValuableLanguages()
  const rareLanguages = getLanguagesByRarity("tres-rare")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Conseils langues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">💰 Langues les plus valorisées</h4>
          <div className="flex flex-wrap gap-2">
            {valuableLanguages.slice(0, 4).map((lang) => (
              <Badge key={lang.code} variant="secondary" className="text-xs">
                {lang.flag} {lang.name} (+{((lang.marketMultiplier - 1) * 100).toFixed(0)}%)
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">⭐ Langues rares</h4>
          <div className="flex flex-wrap gap-2">
            {rareLanguages.map((lang) => (
              <Badge key={lang.code} variant="outline" className="text-xs">
                {lang.flag} {lang.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Les cartes japonaises sont souvent plus chères et recherchées</p>
          <p>• Les cartes anglaises ont une bonne liquidité sur le marché</p>
          <p>• Certaines langues rares peuvent avoir une prime de collection</p>
        </div>
      </CardContent>
    </Card>
  )
}
