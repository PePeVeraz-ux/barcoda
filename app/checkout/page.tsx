import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Package } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutForm } from "@/components/checkout-form"
import { calculateShipping } from "@/lib/shipping"
import type { CartSnapshot, CartItem } from "@/lib/services/cart-service"

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const entries = cookieStore.getAll()
  if (!entries.length) return ""
  return entries.map(({ name, value }) => `${name}=${value}`).join("; ")
}

function resolveBaseUrl(headersList: Awaited<ReturnType<typeof headers>>) {
  const protocol = headersList.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https")
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host")

  if (!host) {
    throw new Error("No se pudo determinar el host para construir la URL base")
  }

  return `${protocol}://${host}`
}

export default async function CheckoutPage() {
  const headersList = await headers()
  const cookieStore = await cookies()

  const baseUrl = resolveBaseUrl(headersList)
  const cookieHeader = buildCookieHeader(cookieStore)

  const response = await fetch(`${baseUrl}/api/cart`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  })

  if (response.status === 401) {
    redirect("/auth/login")
  }

  if (!response.ok) {
    throw new Error("No se pudo obtener la información del carrito para el checkout")
  }

  const snapshot = (await response.json()) as CartSnapshot

  if (!snapshot.cartId || snapshot.itemCount === 0) {
    redirect("/cart")
  }

  const shipping = calculateShipping(snapshot.items as unknown as CartItem[])
  const total = Math.max(0, snapshot.subtotal - snapshot.discount)

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Finalizar Compra</h1>
          <p className="mt-2 text-lg text-muted-foreground">Completa tu pedido</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm cartId={snapshot.cartId!} />
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {snapshot.items.map((item) => {
                    const product = item.products
                    const basePrice = Number(product?.price) || 0
                    const salePrice = Number(product?.sale_price)
                    const isSaleActive = Boolean(
                      product?.sale_active &&
                      Number.isFinite(salePrice) &&
                      salePrice > 0 &&
                      salePrice < basePrice
                    )
                    const unitPrice = Number((isSaleActive ? salePrice : basePrice).toFixed(2))
                    const lineTotal = unitPrice * item.quantity
                    const hasSale = isSaleActive

                    return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
                        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        <div className="text-sm font-bold text-primary">
                          ${lineTotal.toFixed(2)}
                        </div>
                        {hasSale && (
                          <p className="text-xs text-muted-foreground line-through">
                            ${(basePrice * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )})}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${snapshot.subtotal.toFixed(2)}</span>
                  </div>
                  {snapshot.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Descuento</span>
                      <span>- ${snapshot.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {snapshot.couponCode && (
                    <div className="text-xs text-muted-foreground">
                      Cupón aplicado: <span className="font-medium">{snapshot.couponCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Envío</span>
                    </div>
                    <div className="text-right text-xs text-muted-foreground max-w-[200px]">
                      Se coordinará por WhatsApp ({shipping.boxes} caja(s), {shipping.totalWeight.toFixed(2)}kg aprox.)
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
