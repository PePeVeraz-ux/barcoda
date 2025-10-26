"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Sin imagen</p>
      </div>
    )
  }

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
        <Image
          src={images[selectedImage]}
          alt={`${productName} - Imagen ${selectedImage + 1}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority={selectedImage === 0}
        />
        
        {/* Navigation Arrows (only show if more than 1 image) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            
            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
              {selectedImage + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails (only show if more than 1 image) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                selectedImage === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <Image
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
