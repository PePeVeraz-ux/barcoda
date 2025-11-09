"use client"

import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { memo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { PackageCheck, PackageX, AlertCircle, Eye } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"
import { Button } from "@/components/ui/button"
import { ProductQuickView } from "@/components/product-quick-view"

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  stock: number
}

export const ProductCard = memo(function ProductCard({ id, name, price, imageUrl, stock }: ProductCardProps) {
  const { ref, isVisible } = useScrollAnimation()
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const product = {
    id,
    name,
    price,
    image_url: imageUrl,
    stock,
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewOpen(true)
  }

  return (
    <>
      <div 
        ref={ref}
        className={`scroll-animate scroll-slide-up ${isVisible ? "visible" : ""}`}
      >
        <Link href={`/products/${id}`} className="group block relative">
        <div className="space-y-3">
        {/* Image with rounded corners */}
        <div className="relative aspect-square overflow-hidden bg-muted rounded-2xl">
          {/* Wishlist Button */}
          <WishlistButton productId={id} productName={name} />
          
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
        </div>
        
        {/* Product info below image */}
        <div className="space-y-2 px-1">
          <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-base md:text-lg font-bold">
              $ {price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
            </p>
            {stock > 0 && stock <= 10 && (
              <Badge variant="outline" className="text-xs gap-1">
                <PackageCheck className="h-3 w-3" />
                {stock}
              </Badge>
            )}
          </div>
          {/* Stock Status Badge */}
          <div className="flex items-center gap-1 text-xs">
            {stock === 0 ? (
              <Badge variant="destructive" className="gap-1">
                <PackageX className="h-3 w-3" />
                Sin stock
              </Badge>
            ) : stock <= 3 ? (
              <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                <AlertCircle className="h-3 w-3" />
                Pocas unidades
              </Badge>
            ) : null}
          </div>

          {/* Quick View Button - aparece en hover */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickView}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity gap-2 z-10"
          >
            <Eye className="h-4 w-4" />
            Vista Rápida
          </Button>
        </div>
        </div>
      </Link>
    </div>

    {/* Quick View Modal */}
    <ProductQuickView 
      product={product} 
      open={quickViewOpen} 
      onOpenChange={setQuickViewOpen} 
    />
  </>
  )
})
