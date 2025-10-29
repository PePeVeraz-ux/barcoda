"use client"

import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { memo } from "react"

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  stock: number
}

export const ProductCard = memo(function ProductCard({ id, name, price, imageUrl, stock }: ProductCardProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div 
      ref={ref}
      className={`scroll-animate scroll-slide-up ${isVisible ? "visible" : ""}`}
    >
      <Link href={`/products/${id}`} className="group block">
        <div className="space-y-3">
        {/* Image with rounded corners */}
        <div className="relative aspect-square overflow-hidden bg-muted rounded-2xl">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
              <span className="text-sm font-bold text-white px-3 py-1.5 bg-black rounded-lg">Agotado</span>
            </div>
          )}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md animate-scale-in">
              ¡Últimas {stock}!
            </div>
          )}
        </div>
        
        {/* Product info below image */}
        <div className="space-y-1 px-1">
          <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-base md:text-lg font-bold">
            $ {price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
          </p>
        </div>
        </div>
      </Link>
    </div>
  )
})
