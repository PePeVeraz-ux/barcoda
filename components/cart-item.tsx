"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartItemProps {
  item: {
    id: string
    quantity: number
    products: {
      id: string
      name: string
      price: number
      image_url: string
      stock: number
    }
  }
  cartId: string
}

export function CartItem({ item, cartId }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.products.stock) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", item.id)

      if (error) throw error

      setQuantity(newQuantity)
      // No usar router.refresh() para evitar que el navbar pierda estado
    } catch (error) {
      console.error("[v0] Error updating quantity:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", item.id)

      if (error) throw error

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      })

      // No usar router.refresh() para evitar que el navbar pierda estado
    } catch (error) {
      console.error("[v0] Error removing item:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
      <Link
        href={`/products/${item.products.id}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
      >
        <Image
          src={item.products.image_url || "/placeholder.svg"}
          alt={item.products.name}
          fill
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${item.products.id}`} className="font-semibold hover:text-primary transition-colors">
            {item.products.name}
          </Link>
          <p className="text-lg font-bold text-primary mt-1">${Number(item.products.price).toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isLoading || quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            min="1"
            max={item.products.stock}
            value={quantity}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value)
              if (val >= 1 && val <= item.products.stock) {
                updateQuantity(val)
              }
            }}
            className="h-8 w-16 text-center"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isLoading || quantity >= item.products.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <p className="text-lg font-bold">${(Number(item.products.price) * quantity).toFixed(2)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={removeItem}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
