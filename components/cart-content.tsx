"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { CartItemsList } from "@/components/cart-items-list"
import { CartSummary } from "@/components/cart-summary"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { calculateShipping } from "@/lib/shipping"

interface CartContentProps {
  cartId: string
  initialItems: any[]
  initialSubtotal: number
  initialShipping: {
    cost: number
    boxes: number
    totalWeight: number
    isFree: boolean
    details: string
  }
  initialTotal: number
}

export function CartContent({ cartId, initialItems, initialSubtotal, initialShipping, initialTotal }: CartContentProps) {
  const [itemCount, setItemCount] = useState(initialItems.length)
  const [subtotal, setSubtotal] = useState(initialSubtotal)
  const [shipping, setShipping] = useState(initialShipping)
  const [total, setTotal] = useState(initialTotal)
  const supabase = createClient()

  const checkItemCount = useCallback(async () => {
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id, quantity, products(price, weight)")
      .eq("cart_id", cartId)

    setItemCount(cartItems?.length || 0)
    
    // Recalcular subtotal y shipping
    if (cartItems && cartItems.length > 0) {
      const newSubtotal = cartItems.reduce((sum, item: any) => {
        return sum + (Number(item.products?.price || 0) * item.quantity)
      }, 0)
      const newShipping = calculateShipping(cartItems as any)
      const newTotal = newSubtotal + newShipping.cost
      
      setSubtotal(newSubtotal)
      setShipping(newShipping)
      setTotal(newTotal)
    } else {
      setSubtotal(0)
      setShipping({ cost: 0, boxes: 0, totalWeight: 0, isFree: true, details: "" })
      setTotal(0)
    }
  }, [cartId, supabase])

  useEffect(() => {
    // Escuchar evento custom
    const handleCartUpdate = () => {
      checkItemCount()
    }
    window.addEventListener('cart-updated', handleCartUpdate)

    // Realtime backup
    const channel = supabase
      .channel("cart_content_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_id=eq.${cartId}`,
        },
        () => {
          checkItemCount()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      supabase.removeChannel(channel)
    }
  }, [cartId, supabase, checkItemCount])

  if (itemCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
          <Button asChild>
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos ({itemCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CartItemsList initialItems={initialItems} cartId={cartId} />
          </CardContent>
        </Card>
      </div>

      <div>
        <CartSummary 
          cartId={cartId}
          initialSubtotal={subtotal}
          initialShipping={shipping}
          initialTotal={total} 
          initialItemCount={itemCount}
        />
      </div>
    </div>
  )
}
