"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
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
    <Card
      ref={ref}
      className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover-lift border-2 hover:border-primary/50 scroll-animate scroll-slide-up ${isVisible ? "visible" : ""}`}
    >
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
              <span className="text-lg font-bold text-white px-4 py-2 bg-destructive/90 rounded-lg">Agotado</span>
            </div>
          )}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full animate-scale-in">
              ¡Últimas {stock}!
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3 md:p-4">
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-base md:text-lg line-clamp-1 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xl md:text-2xl font-bold text-primary mt-2">${price.toFixed(2)}</p>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {stock > 0 ? `${stock} disponibles` : "Sin stock"}
        </p>
      </CardContent>
      <CardFooter className="p-3 md:p-4 pt-0">
        <Button className="w-full transition-all duration-300 hover:scale-105" disabled={stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  )
})
