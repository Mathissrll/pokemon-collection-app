"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { CardMarketService } from "@/lib/cardmarket-service"

interface FrenchProductAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function FrenchProductAutocomplete({ value, onChange, placeholder }: FrenchProductAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (value.length > 2) {
      const frenchSuggestions = CardMarketService.getFrenchProductSuggestions(value)
      setSuggestions(frenchSuggestions)
      setShowSuggestions(frenchSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Check className="h-4 w-4 mr-2 opacity-0" />
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
