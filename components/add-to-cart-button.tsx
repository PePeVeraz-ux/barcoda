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
    
    // Timeout de seguridad para evitar que se quede en "Agregando..."
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Tiempo agotado",
        description: "La operación tardó demasiado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }, 10000) // 10 segundos

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        clearTimeout(timeoutId)
        setIsLoading(false)
        router.push("/auth/login")
        return
      }

      // VALIDACIÓN PREVIA: Verificar cantidad actual en carrito
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (cart) {
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("quantity")
          .eq("cart_id", cart.id)
          .eq("product_id", productId)
          .single()

        if (existingItem && existingItem.quantity >= stock) {
          clearTimeout(timeoutId)
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${stock} unidad(es) disponible(s) y ya tienes ${existingItem.quantity} en tu carrito`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Usar API route con validación de stock
      const response = await fetch("/api/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: user.id }),
      })

      const result = await response.json()

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 409) {
          // Stock insuficiente
          toast({
            title: "Stock insuficiente",
            description: result.message || "No hay suficiente stock disponible",
            variant: "destructive",
          })
        } else {
          throw new Error(result.error || "Error al agregar al carrito")
        }
        return
      }
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito",
      })

      // Disparar evento custom para actualizar el contador manualmente
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      clearTimeout(timeoutId)
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
