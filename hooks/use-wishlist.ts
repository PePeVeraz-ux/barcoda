"use client"

import { useWishlistContext } from "@/contexts/wishlist-context"

export function useWishlist() {
  return useWishlistContext()
}
