import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CartItem } from "@/components/cart-item"
import { ShoppingBag } from "lucide-react"

export default async function CartPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

  let cartItems: any[] = []
  let total = 0

  if (cart) {
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: false })

    cartItems = data || []
    total = cartItems.reduce((sum, item) => sum + Number(item.products.price) * item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Carrito de Compras</h1>
          <p className="mt-2 text-lg text-muted-foreground">Revisa tus productos antes de finalizar la compra</p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Productos ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} cartId={cart!.id} />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
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

                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/products">Seguir Comprando</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
              <Button asChild>
                <Link href="/products">Explorar Productos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
