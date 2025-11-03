import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CartContent } from "@/components/cart-content"
import { calculateShipping } from "@/lib/shipping"

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
  let subtotal = 0
  let shipping = { cost: 0, boxes: 0, totalWeight: 0, isFree: true, details: "" }
  let total = 0

  if (cart) {
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: false })

    cartItems = data || []
    subtotal = cartItems.reduce((sum, item) => sum + Number(item.products.price) * item.quantity, 0)
    shipping = calculateShipping(cartItems)
    total = subtotal + shipping.cost
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Carrito de Compras</h1>
          <p className="mt-2 text-lg text-muted-foreground">Revisa tus productos antes de finalizar la compra</p>
        </div>

        {cart ? (
          <CartContent 
            cartId={cart.id} 
            initialItems={cartItems} 
            initialSubtotal={subtotal}
            initialShipping={shipping}
            initialTotal={total} 
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Cargando carrito...</p>
          </div>
        )}
      </div>
    </div>
  )
}
