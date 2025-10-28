import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import Image from "next/image"

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

  if (!cart) {
    redirect("/cart")
  }

  const { data: cartItems } = await supabase.from("cart_items").select("*, products(*)").eq("cart_id", cart.id)

  if (!cartItems || cartItems.length === 0) {
    redirect("/cart")
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.products.price) * item.quantity, 0)

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Finalizar Compra</h1>
          <p className="mt-2 text-lg text-muted-foreground">Completa tu pedido</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm cartId={cart.id} cartItems={cartItems} total={total} />
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
                        <Image
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">
                          ${(Number(item.products.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>Gratis</span>
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
