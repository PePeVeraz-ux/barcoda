"use client"

import { useState, useRef, MouseEvent } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomActive, setIsZoomActive] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

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

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZoomActive(true)
  }

  const handleMouseLeave = () => {
    setIsZoomActive(false)
  }

  // Calcular la posición y tamaño del recuadro de zoom (rectangular)
  const lensWidth = 180 // Ancho del recuadro de lupa
  const lensHeight = 120 // Alto del recuadro de lupa
  const zoomLevel = 2.5 // Nivel de zoom

  // Calcular las posiciones limitadas del lens
  const containerWidth = imageContainerRef.current?.clientWidth || 0
  const containerHeight = imageContainerRef.current?.clientHeight || 0
  
  const lensX = Math.max(0, Math.min(mousePosition.x - lensWidth / 2, containerWidth - lensWidth))
  const lensY = Math.max(0, Math.min(mousePosition.y - lensHeight / 2, containerHeight - lensHeight))
  
  // Calcular el centro del lens para el zoom
  const lensCenterX = lensX + lensWidth / 2
  const lensCenterY = lensY + lensHeight / 2

  return (
    <div className="space-y-4">
      {/* Main Image Container - tamaño fijo */}
      <div className="relative">
        <div 
          ref={imageContainerRef}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted group w-full"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={images[selectedImage]}
            alt={`${productName} - Imagen ${selectedImage + 1}`}
            fill
            className="object-contain"
            priority={selectedImage === 0}
          />
          
          {/* Lens overlay - recuadro rectangular que sigue el cursor */}
          {isZoomActive && containerWidth > 0 && (
            <div
              className="absolute border-2 border-primary bg-white/20 pointer-events-none shadow-lg"
              style={{
                width: `${lensWidth}px`,
                height: `${lensHeight}px`,
                left: `${lensX}px`,
                top: `${lensY}px`,
              }}
            />
          )}
          
          {/* Zoom Icon */}
          <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-5 w-5" />
          </div>
        
        {/* Navigation Arrows (only show if more than 1 image) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity z-10"
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

        {/* Zoomed view - panel lateral flotante */}
        {isZoomActive && containerWidth > 0 && (
          <div className="hidden lg:block absolute left-[calc(100%+1rem)] top-0 w-full aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border shadow-xl z-50">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${images[selectedImage]})`,
                backgroundSize: `${containerWidth * zoomLevel}px ${containerHeight * zoomLevel}px`,
                backgroundPosition: `${-(lensCenterX * zoomLevel - containerWidth / 2)}px ${-(lensCenterY * zoomLevel - containerHeight / 2)}px`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
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
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
