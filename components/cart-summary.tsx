"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Package, Percent } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartSummaryProps {
  cartId: string
  subtotal: number
  discount: number
  couponCode: string
  itemCount: number
  isRefreshing?: boolean
}

export function CartSummary({ cartId, subtotal, discount, couponCode, itemCount, isRefreshing = false }: CartSummaryProps) {
  const [inputCode, setInputCode] = useState(couponCode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setInputCode(couponCode)
  }, [couponCode])

  if (!cartId || itemCount === 0) {
    return null
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discount)
  const isBusy = isSubmitting || isRefreshing

  const applyCoupon = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Ingresa un cupón",
        description: "Escribe un código antes de aplicar",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (!cartId) {
        throw new Error("No se encontró el carrito")
      }

      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode.trim(), cartId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Cupón no válido",
          description: data.message || "Revisa las condiciones del cupón",
          variant: "destructive",
        })
        return
      }

      setInputCode((data.couponCode || inputCode).toUpperCase())

      toast({
        title: "Cupón aplicado",
        description: data.message || "El descuento se aplicó correctamente",
      })

      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      console.error("Error applying coupon", error)
      toast({
        title: "Error",
        description: "No se pudo aplicar el cupón. Intenta de nuevo",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeCoupon = async () => {
    setIsSubmitting(true)
    try {
      if (!cartId) {
        throw new Error("No se encontró el carrito")
      }

      const response = await fetch("/api/coupons/apply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "No se pudo remover",
          description: data.message || "Intenta nuevamente",
          variant: "destructive",
        })
        return
      }

      setInputCode("")

      toast({
        title: "Cupón removido",
        description: "El descuento fue eliminado del carrito",
      })

      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      console.error("Error removing coupon", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cupón",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Resumen de Compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="coupon-code" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3" /> Cupón de descuento
            </label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                value={inputCode}
                onChange={(event) => setInputCode(event.target.value.toUpperCase())}
                placeholder="BF2024"
                className="uppercase"
                disabled={isSubmitting}
              />
              <Button type="button" onClick={applyCoupon} disabled={isSubmitting || !inputCode.trim()}>
                Aplicar
              </Button>
            </div>
            {couponCode && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Cupón aplicado: <strong>{couponCode}</strong></span>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={removeCoupon} disabled={isSubmitting}>
                  Quitar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} productos)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>Descuento</span>
              <span>- ${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Envío</span>
            </div>
            <div className="text-xs text-muted-foreground text-right max-w-[160px]">
              El costo del envío se determinará por WhatsApp
            </div>
          </div>
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between font-bold text-lg">
              <span>Total (sin envío)</span>
              <span className="text-primary">${subtotalAfterDiscount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">El envío se cotiza individualmente.</p>
          </div>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout">Proceder al Pago</Link>
        </Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/products">Seguir Comprando</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
