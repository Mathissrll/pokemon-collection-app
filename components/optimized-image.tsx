"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  fallbackSrc?: string
  aspectRatio?: "square" | "video" | "auto"
  loading?: "lazy" | "eager"
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc = "/placeholder.svg",
  aspectRatio = "square",
  loading = "lazy"
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: ""
  }

  const handleError = () => {
    setImageError(true)
  }

  const handleLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div className={cn(
      "bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden",
      aspectRatioClasses[aspectRatio],
      containerClassName
    )}>
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            !imageLoaded && "opacity-0",
            imageLoaded && "opacity-100",
            className
          )}
          loading={loading}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={fallbackSrc}
            alt="placeholder"
            className="w-16 h-16 opacity-40 object-contain"
          />
        </div>
      )}
    </div>
  )
} 