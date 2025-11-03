"use client"

import { CartItem } from "@/components/cart-item"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface CartItemsListProps {
  initialItems: any[]
  cartId: string
}

export function CartItemsList({ initialItems, cartId }: CartItemsListProps) {
  const [items, setItems] = useState(initialItems)
  const supabase = createClient()

  const fetchCartItems = useCallback(async () => {
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("cart_id", cartId)

    if (cartItems) {
      setItems(cartItems)
    }
  }, [cartId, supabase])

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    // Escuchar evento custom para actualización inmediata
    const handleCartUpdate = () => {
      fetchCartItems()
    }
    window.addEventListener('cart-updated', handleCartUpdate)

    // Suscribirse a cambios en cart_items (backup con Realtime)
    const channel = supabase
      .channel("cart_items_list_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_id=eq.${cartId}`,
        },
        () => {
          // Actualizar items localmente sin router.refresh()
          fetchCartItems()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      supabase.removeChannel(channel)
    }
  }, [cartId, supabase, fetchCartItems])

  return (
    <>
      {items.map((item) => (
        <CartItem key={item.id} item={item} cartId={cartId} />
      ))}
    </>
  )
}
