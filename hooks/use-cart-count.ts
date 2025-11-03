"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useCartCount() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchCartCount = async () => {
    if (!user) {
      setCount(0)
      setIsLoading(false)
      return
    }

    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!cart) {
        setCount(0)
        setIsLoading(false)
        return
      }

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("cart_id", cart.id)

      const totalCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCount(totalCount)
    } catch (error) {
      console.error("Error fetching cart count:", error)
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCartCount()

    // Escuchar evento custom para actualización inmediata
    const handleCartUpdate = () => {
      fetchCartCount()
    }
    window.addEventListener('cart-updated', handleCartUpdate)

    // Suscribirse a cambios en cart_items (backup con Realtime)
    const channel = supabase
      .channel("cart_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
        },
        () => {
          fetchCartCount()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      supabase.removeChannel(channel)
    }
  }, [user])

  return { count, isLoading, refresh: fetchCartCount }
}
