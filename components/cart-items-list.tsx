"use client"

import { CartItem } from "@/components/cart-item"
import type { CartItem as SnapshotItem } from "@/lib/services/cart-service"

interface CartItemsListProps {
  items: SnapshotItem[]
  cartId: string
}

export function CartItemsList({ items, cartId }: CartItemsListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <>
      {items.map((item) => (
        <CartItem key={item.id} item={item} cartId={cartId} />
      ))}
    </>
  )
}
