"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { calculateShipping } from "@/lib/shipping"

interface CartSummaryProps {
  cartId: string
  initialSubtotal: number
  initialShipping: {
    cost: number
    boxes: number
    totalWeight: number
    isFree: boolean
    details: string
  }
  initialTotal: number
  initialItemCount: number
}

export function CartSummary({ cartId, initialSubtotal, initialShipping, initialTotal, initialItemCount }: CartSummaryProps) {
  const [subtotal, setSubtotal] = useState(initialSubtotal)
  const [shipping, setShipping] = useState(initialShipping)
  const [total, setTotal] = useState(initialTotal)
  const [itemCount, setItemCount] = useState(initialItemCount)
  const supabase = createClient()

  const updateSummary = useCallback(async () => {
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("quantity, products(price, weight)")
      .eq("cart_id", cartId)

    if (cartItems && cartItems.length > 0) {
      const newSubtotal = cartItems.reduce((sum, item: any) => {
        return sum + (Number(item.products?.price || 0) * item.quantity)
      }, 0)
      const newShipping = calculateShipping(cartItems as any)
      const newTotal = newSubtotal + newShipping.cost
      
      setSubtotal(newSubtotal)
      setShipping(newShipping)
      setTotal(newTotal)
      setItemCount(cartItems.length)
    } else {
      setSubtotal(0)
      setShipping({ cost: 0, boxes: 0, totalWeight: 0, isFree: true, details: "" })
      setTotal(0)
      setItemCount(0)
    }
  }, [cartId, supabase])

  useEffect(() => {
    // Escuchar evento custom
    const handleCartUpdate = () => {
      updateSummary()
    }
    window.addEventListener('cart-updated', handleCartUpdate)

    // Realtime backup
    const channel = supabase
      .channel("cart_summary_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_id=eq.${cartId}`,
        },
        () => {
          updateSummary()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      supabase.removeChannel(channel)
    }
  }, [cartId, supabase, updateSummary])

  if (itemCount === 0) {
    return null
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Resumen de Compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} productos)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Envío</span>
            </div>
            <div className="text-right">
              <div>${shipping.cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                {shipping.boxes} caja(s) - {shipping.totalWeight.toFixed(2)}kg
              </div>
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout">Proceder al Pago</Link>
        </Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/products">Seguir Comprando</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
