"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface WishlistContextValue {
  wishlistIds: string[]
  isLoading: boolean
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string, productName: string) => Promise<boolean>
  refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()
  const { toast } = useToast()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set())
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", user.id)

      if (error) throw error

      const ids = new Set(data?.map((item) => item.product_id) ?? [])
      setWishlistIds(ids)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  const isInWishlist = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds])

  const toggleWishlist = useCallback(
    async (productId: string, productName: string) => {
      if (!user) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para agregar favoritos",
          variant: "destructive",
        })
        return false
      }

      const isFavorite = wishlistIds.has(productId)

      try {
        if (isFavorite) {
          const { error } = await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId)

          if (error) throw error

          setWishlistIds((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
          })

          toast({
            title: "Eliminado de favoritos",
            description: `${productName} fue eliminado de tus favoritos`,
          })
        } else {
          const { error } = await supabase.from("wishlist_items").insert({
            user_id: user.id,
            product_id: productId,
          })

          if (error) throw error

          setWishlistIds((prev) => {
            const next = new Set(prev)
            next.add(productId)
            return next
          })

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
    },
    [supabase, toast, user, wishlistIds]
  )

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const initialize = async () => {
      await fetchWishlist()

      if (!user) {
        return
      }

      channel = supabase
        .channel(`wishlist_changes_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "wishlist_items",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void fetchWishlist()
          }
        )
        .subscribe()
    }

    void initialize()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchWishlist, supabase, user])

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds: Array.from(wishlistIds),
      isLoading,
      isInWishlist,
      toggleWishlist,
      refresh: fetchWishlist,
    }),
    [fetchWishlist, isInWishlist, isLoading, toggleWishlist, wishlistIds]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlistContext() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider")
  }

  return context
}
