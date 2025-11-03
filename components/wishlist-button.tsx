"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  productId: string
  productName: string
  variant?: "default" | "icon"
  className?: string
}

export function WishlistButton({ 
  productId, 
  productName, 
  variant = "icon",
  className 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isFavorite = isInWishlist(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist(productId, productName)
  }

  if (variant === "default") {
    return (
      <Button
        variant={isFavorite ? "default" : "outline"}
        onClick={handleClick}
        className={cn("gap-2", className)}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        {isFavorite ? "En Favoritos" : "Agregar a Favoritos"}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all z-10",
        isFavorite && "text-red-500 hover:text-red-600",
        className
      )}
      title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          isFavorite && "fill-current"
        )} 
      />
    </Button>
  )
}
