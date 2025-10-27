"use client"

import { createClient } from "@/lib/supabase/client"
import { useCallback, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function useCart() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const addToCart = useCallback(async (productId: string) => {
    setIsLoading(true)
    
    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Tiempo agotado",
        description: "La operación tardó demasiado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }, 10000)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        clearTimeout(timeoutId)
        setIsLoading(false)
        return { success: false, needsAuth: true }
      }

      // Get or create cart
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!cart) {
        const { data: newCart, error: cartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single()

        if (cartError) throw cartError
        cart = newCart
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cart.id,
          product_id: productId,
          quantity: 1,
        })

        if (error) throw error
      }

      clearTimeout(timeoutId)
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito",
      })

      return { success: true, needsAuth: false }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
      return { success: false, needsAuth: false }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId)

      if (error) throw error

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      })

      return { success: true }
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  return {
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
  }
}
