"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, memo } from "react"
import { useCart } from "@/hooks/use-cart"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { CartItem as SnapshotItem } from "@/lib/services/cart-service"

interface CartItemProps {
  item: SnapshotItem
  cartId: string
}

export const CartItem = memo(function CartItem({ item, cartId }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const { isLoading, updateQuantity: updateQty, removeItem: removeFromCart } = useCart()
  const { toast } = useToast()

  const getUnitPrice = () => {
    const basePrice = Number(item.products.price) || 0
    const salePrice = Number(item.products?.sale_price)
    const isSaleActive = Boolean(item.products?.sale_active && Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice)
    return {
      unitPrice: Number((isSaleActive ? salePrice : basePrice).toFixed(2)),
      isSaleActive,
      basePrice,
    }
  }

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return
    
    if (newQuantity > item.products.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${item.products.stock} unidad(es) disponible(s)`,
        variant: "destructive",
      })
      return
    }

    // Optimistic update
    const prevQuantity = quantity
    setQuantity(newQuantity)

    const result = await updateQty(item.id, newQuantity)
    
    // Revert on failure
    if (!result.success) {
      setQuantity(prevQuantity)
    } else {
      // Disparar evento para actualizar contador
      window.dispatchEvent(new Event('cart-updated'))
    }
  }

  const removeItem = async () => {
    await removeFromCart(item.id)
    // Disparar evento para actualizar contador inmediatamente
    window.dispatchEvent(new Event('cart-updated'))
  }

  const { unitPrice, isSaleActive, basePrice } = getUnitPrice()

  return (
    <div className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
      <Link
        href={`/products/${item.products.id}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
      >
        <Image
          src={item.products.image_url || "/placeholder.svg"}
          alt={item.products.name}
          fill
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${item.products.id}`} className="font-semibold hover:text-primary transition-colors">
            {item.products.name}
          </Link>
          <div className="mt-1 text-lg font-bold text-primary">
            ${unitPrice.toFixed(2)}
          </div>
          {isSaleActive && (
            <p className="text-sm text-muted-foreground line-through">
              ${basePrice.toFixed(2)}
            </p>
          )}
          
          {/* Alerta de stock */}
          {item.products.stock === 0 && (
            <Badge variant="destructive" className="mt-2 gap-1">
              <AlertCircle className="h-3 w-3" />
              Sin stock - Eliminar del carrito
            </Badge>
          )}
          {item.products.stock > 0 && quantity > item.products.stock && (
            <Badge variant="secondary" className="mt-2 gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
              <AlertCircle className="h-3 w-3" />
              Solo {item.products.stock} disponible(s)
            </Badge>
          )}
          {item.products.stock > 0 && item.products.stock <= 5 && quantity <= item.products.stock && (
            <Badge variant="secondary" className="mt-2 gap-1 text-xs">
              Pocas unidades disponibles
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isLoading || quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            min="1"
            max={item.products.stock}
            value={quantity}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value)
              if (val >= 1 && val <= item.products.stock) {
                updateQuantity(val)
              }
            }}
            className="h-8 w-16 text-center"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isLoading || quantity >= item.products.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="text-lg font-bold text-primary">${(unitPrice * quantity).toFixed(2)}</div>
        {isSaleActive && (
          <p className="text-xs text-muted-foreground line-through">
            ${(basePrice * quantity).toFixed(2)}
          </p>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={removeItem}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
