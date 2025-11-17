import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { validateStockAvailability } from "@/lib/inventory"

interface RouteContext {
  params: Promise<{ itemId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params
    const body = (await request.json().catch(() => ({}))) as { quantity?: number }
    const quantity = Number(body.quantity)

    if (!itemId) {
      return NextResponse.json({ error: "itemId es requerido" }, { status: 400 })
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: "quantity debe ser un número positivo" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: item, error } = await supabase
      .from("cart_items")
      .select("id, cart_id, product_id, carts!inner(user_id)")
      .eq("id", itemId)
      .single()

    if (error || !item) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
    }

    const ownerId = Array.isArray(item.carts) ? item.carts[0]?.user_id : (item.carts as { user_id?: string } | null)?.user_id

    if (ownerId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const validation = await validateStockAvailability(item.product_id, quantity, item.cart_id)

    if (!validation.available) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
          availableStock: validation.availableStock,
        },
        { status: 409 }
      )
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .select("id, product_id, quantity")
      .single()

    if (updateError || !updatedItem) {
      console.error("Error updating cart item quantity:", updateError)
      return NextResponse.json({ error: "No se pudo actualizar el carrito" }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error("Error in PATCH /api/cart/items/[itemId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params

    if (!itemId) {
      return NextResponse.json({ error: "itemId es requerido" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: item, error } = await supabase
      .from("cart_items")
      .select("id, cart_id, carts!inner(user_id)")
      .eq("id", itemId)
      .single()

    if (error || !item) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
    }

    const ownerId = Array.isArray(item.carts) ? item.carts[0]?.user_id : (item.carts as { user_id?: string } | null)?.user_id

    if (ownerId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)

    if (deleteError) {
      console.error("Error deleting cart item:", deleteError)
      return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/cart/items/[itemId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
