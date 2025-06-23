"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { CardMarketService } from "@/lib/cardmarket-service"

interface CardMarketValidatorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CardMarketValidator({ value, onChange, placeholder }: CardMarketValidatorProps) {
  const [validationState, setValidationState] = useState<"idle" | "valid" | "invalid" | "checking">("idle")
  const [productInfo, setProductInfo] = useState<{ id: string; type: string } | null>(null)

  useEffect(() => {
    if (!value) {
      setValidationState("idle")
      setProductInfo(null)
      return
    }

    setValidationState("checking")

    // Délai pour éviter trop de validations
    const timer = setTimeout(() => {
      const isValid = CardMarketService.isValidCardMarketUrl(value)
      if (isValid) {
        const info = CardMarketService.getProductInfoFromUrl(value)
        setProductInfo(info)
        setValidationState("valid")
      } else {
        setProductInfo(null)
        setValidationState("invalid")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [value])

  const getValidationIcon = () => {
    switch (validationState) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "checking":
        return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
      default:
        return null
    }
  }

  const getValidationBadge = () => {
    switch (validationState) {
      case "valid":
        return (
          <Badge variant="default" className="text-xs">
            URL Valide {productInfo && `(ID: ${productInfo.id})`}
          </Badge>
        )
      case "invalid":
        return (
          <Badge variant="destructive" className="text-xs">
            URL Invalide
          </Badge>
        )
      case "checking":
        return (
          <Badge variant="outline" className="text-xs">
            Vérification...
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pr-10 ${
            validationState === "valid" ? "border-green-500" : validationState === "invalid" ? "border-red-500" : ""
          }`}
        />
        {validationState !== "idle" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getValidationIcon()}</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {getValidationBadge()}
        {validationState === "valid" && productInfo && (
          <span className="text-xs text-muted-foreground">Type détecté: {productInfo.type}</span>
        )}
      </div>

      {validationState === "invalid" && (
        <p className="text-xs text-red-600">
          L'URL doit être un lien CardMarket valide (ex: https://www.cardmarket.com/fr/Pokemon/...)
        </p>
      )}
    </div>
  )
}
