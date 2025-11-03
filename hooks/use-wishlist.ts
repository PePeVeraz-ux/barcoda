"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set())
      setIsLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id)

      const ids = new Set(data?.map(item => item.product_id) || [])
      setWishlistIds(ids)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchWishlist()

    // Suscribirse a cambios
    const channel = supabase
      .channel("wishlist_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishlist_items",
        },
        () => {
          fetchWishlist()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchWishlist])

  const toggleWishlist = useCallback(async (productId: string, productName: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar favoritos",
        variant: "destructive",
      })
      return false
    }

    try {
      const isInWishlist = wishlistIds.has(productId)

      if (isInWishlist) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)

        if (error) throw error

        setWishlistIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })

        toast({
          title: "Eliminado de favoritos",
          description: `${productName} fue eliminado de tus favoritos`,
        })
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from("wishlist_items")
          .insert({
            user_id: user.id,
            product_id: productId,
          })

        if (error) throw error

        setWishlistIds(prev => new Set(prev).add(productId))

        toast({
          title: "Agregado a favoritos",
          description: `${productName} fue agregado a tus favoritos`,
        })
      }

      return true
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tus favoritos",
        variant: "destructive",
      })
      return false
    }
  }, [user, wishlistIds, supabase, toast])

  const isInWishlist = useCallback((productId: string) => {
    return wishlistIds.has(productId)
  }, [wishlistIds])

  return {
    wishlistIds: Array.from(wishlistIds),
    isInWishlist,
    toggleWishlist,
    isLoading,
    refresh: fetchWishlist,
  }
}
