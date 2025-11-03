import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateStockAvailability } from "@/lib/inventory"

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json()

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "productId and userId are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create cart
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from("carts")
        .insert({ user_id: userId })
        .select("id")
        .single()

      if (cartError) {
        return NextResponse.json(
          { error: "Failed to create cart" },
          { status: 500 }
        )
      }
      cart = newCart
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .single()

    const newTotalQuantity = existingItem ? existingItem.quantity + 1 : 1

    // Obtener stock del producto
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Calcular stock reservado en OTROS carritos (excluyendo el actual)
    const { data: otherCartItems } = await supabase
      .from("cart_items")
      .select("quantity, carts!inner(id)")
      .eq("product_id", productId)
      .neq("cart_id", cart.id)

    const reservedInOtherCarts = otherCartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

    // Stock disponible para este usuario = stock total - reservado en otros carritos
    const availableForUser = Math.max(0, product.stock - reservedInOtherCarts)

    // Validar que la nueva cantidad total no exceda el stock disponible
    if (newTotalQuantity > availableForUser) {
      const message = availableForUser === 0
        ? "Este producto ya no está disponible"
        : `Solo puedes agregar ${availableForUser} unidad(es) a tu carrito${existingItem ? ` (ya tienes ${existingItem.quantity})` : ""}`

      return NextResponse.json(
        {
          success: false,
          message,
          availableStock: availableForUser,
          currentInCart: existingItem?.quantity || 0,
        },
        { status: 409 }
      )
    }

    // Add or update item in cart
    if (existingItem) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newTotalQuantity })
        .eq("id", existingItem.id)

      if (error) {
        return NextResponse.json(
          { error: "Failed to update cart item" },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        quantity: 1,
      })

      if (error) {
        return NextResponse.json(
          { error: "Failed to add cart item" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
