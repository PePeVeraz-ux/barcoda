"use client"

import { useCallback, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { addCartItem, CartServiceError, deleteCartItem, updateCartItemQuantity } from "@/lib/services/cart-service"

export function useCart() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
      await addCartItem(productId)

      clearTimeout(timeoutId)
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó a tu carrito",
      })

      return { success: true, needsAuth: false }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error adding to cart:", error)

      if (error instanceof CartServiceError) {
        toast({
          title: error.status === 409 ? "Stock insuficiente" : "Error",
          description: error.message,
          variant: "destructive",
        })

        return { success: false, needsAuth: error.status === 401 }
      }

      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })

      return { success: false, needsAuth: false }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    setIsLoading(true)
    try {
      await updateCartItemQuantity(itemId, newQuantity)

      return { success: true }
    } catch (error) {
      console.error("Error updating quantity:", error)

      if (error instanceof CartServiceError) {
        toast({
          title: error.status === 409 ? "Stock insuficiente" : "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la cantidad",
          variant: "destructive",
        })
      }

      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true)
    try {
      await deleteCartItem(itemId)

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      })

      return { success: true }
    } catch (error) {
      console.error("Error removing item:", error)

      if (error instanceof CartServiceError) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      }

      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
  }
}
