"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { CartItemsList } from "@/components/cart-items-list"
import { CartSummary } from "@/components/cart-summary"
import { fetchCartSnapshot, type CartSnapshot } from "@/lib/services/cart-service"

interface CartContentProps {
  initialSnapshot: CartSnapshot
}

export function CartContent({ initialSnapshot }: CartContentProps) {
  const [snapshot, setSnapshot] = useState<CartSnapshot>(initialSnapshot)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshSnapshot = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const updated = await fetchCartSnapshot()
      setSnapshot(updated)
    } catch (error) {
      console.error("Error refreshing cart snapshot:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setSnapshot(initialSnapshot)
  }, [initialSnapshot])

  useEffect(() => {
    const handleCartUpdate = () => {
      refreshSnapshot()
    }

    window.addEventListener("cart-updated", handleCartUpdate)

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [refreshSnapshot])

  if (!snapshot.cartId || snapshot.itemCount === 0) {
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
            <CardTitle>Productos ({snapshot.itemCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CartItemsList items={snapshot.items} cartId={snapshot.cartId!} />
          </CardContent>
        </Card>
      </div>

      <div>
        <CartSummary 
          cartId={snapshot.cartId!}
          subtotal={snapshot.subtotal}
          discount={snapshot.discount}
          couponCode={snapshot.couponCode}
          itemCount={snapshot.itemCount}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  )
}
