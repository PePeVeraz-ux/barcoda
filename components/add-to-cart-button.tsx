"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { addCartItem, CartServiceError } from "@/lib/services/cart-service"

interface AddToCartButtonProps {
  productId: string
  stock: number
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

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
      if (!user) {
        clearTimeout(timeoutId)
        setIsLoading(false)
        router.push("/auth/login")
        return
      }

      await addCartItem(productId)

      clearTimeout(timeoutId)

      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito",
      })

      // Disparar evento custom para actualizar el contador manualmente
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("[cart] Error adding to cart:", error)

      if (error instanceof CartServiceError) {
        if (error.status === 401) {
          router.push("/auth/login")
          return
        }

        toast({
          title: error.status === 409 ? "Stock insuficiente" : "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el producto al carrito",
          variant: "destructive",
        })
      }
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
