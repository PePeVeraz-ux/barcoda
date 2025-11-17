import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { validateStockAvailability } from "@/lib/inventory"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { productId?: string; quantity?: number }
    const productId = body.productId
    const quantity = Number(body.quantity ?? 1)

    if (!productId || !Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "productId y quantity (> 0) son requeridos" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener o crear carrito del usuario
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (cartError && cartError.code !== "PGRST116") {
      console.error("Error fetching cart:", cartError)
      return NextResponse.json({ error: "No se pudo obtener el carrito" }, { status: 500 })
    }

    if (!cart) {
      const cartInsert = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single()

      if (cartInsert.error || !cartInsert.data) {
        console.error("Error creating cart:", cartInsert.error)
        return NextResponse.json({ error: "No se pudo crear el carrito" }, { status: 500 })
      }

      cart = cartInsert.data
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .single()

    const newTotalQuantity = (existingItem?.quantity ?? 0) + quantity

    const validation = await validateStockAvailability(productId, newTotalQuantity, cart.id)

    if (!validation.available) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
          availableStock: validation.availableStock,
          currentInCart: existingItem?.quantity ?? 0,
        },
        { status: 409 }
      )
    }

    if (existingItem) {
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newTotalQuantity })
        .eq("id", existingItem.id)
        .select("id, product_id, quantity")
        .single()

      if (updateError || !updatedItem) {
        console.error("Error updating cart item:", updateError)
        return NextResponse.json({ error: "No se pudo actualizar el carrito" }, { status: 500 })
      }

      return NextResponse.json({ success: true, item: updatedItem })
    }

    const { data: insertedItem, error: insertError } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cart.id,
        product_id: productId,
        quantity,
      })
      .select("id, product_id, quantity")
      .single()

    if (insertError || !insertedItem) {
      console.error("Error inserting cart item:", insertError)
      return NextResponse.json({ error: "No se pudo agregar al carrito" }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: insertedItem })
  } catch (error) {
    console.error("Error in POST /api/cart/items:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
