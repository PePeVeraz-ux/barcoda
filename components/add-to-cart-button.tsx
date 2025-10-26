"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  productId: string
  stock: number
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get or create cart
      let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

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

      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito",
      })

      // No usar router.refresh() para evitar que el navbar pierda estado
    } catch (error) {
      console.error("[v0] Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" size="lg" disabled={stock === 0 || isLoading} onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isLoading ? "Agregando..." : "Agregar al Carrito"}
    </Button>
  )
}
