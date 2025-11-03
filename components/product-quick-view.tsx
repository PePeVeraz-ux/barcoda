"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { WishlistButton } from "@/components/wishlist-button"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  image_url: string
  category_id?: string
}

interface ProductQuickViewProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Badge variant="destructive" className="text-lg px-4 py-2">Agotado</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Price */}
            <div>
              <p className="text-3xl font-bold text-primary">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
              </p>
            </div>

            {/* Stock Status */}
            <div>
              {product.stock === 0 ? (
                <Badge variant="destructive">Sin stock</Badge>
              ) : product.stock <= 5 ? (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                  Solo {product.stock} disponibles
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Disponible ({product.stock} unidades)
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground line-clamp-6">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto">
              <AddToCartButton productId={product.id} stock={product.stock} />
              
              <div className="grid grid-cols-2 gap-2">
                <WishlistButton 
                  productId={product.id} 
                  productName={product.name} 
                  variant="default"
                  className="w-full"
                />
                
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/products/${product.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
