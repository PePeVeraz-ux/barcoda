import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function parseNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function POST(request: NextRequest) {
  try {
    const { code, cartId } = await request.json()

    if (!code || !cartId) {
      return NextResponse.json(
        { message: "Código y carrito son requeridos" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, user_id, coupon_id")
      .eq("id", cartId)
      .single()

    if (cartError || !cart) {
      return NextResponse.json({ message: "Carrito no encontrado" }, { status: 404 })
    }

    if (cart.user_id !== user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const normalizedCode = String(code).trim().toUpperCase()

    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("id, code, description, discount_type, discount_value, min_subtotal, max_subtotal, active, valid_from, valid_to")
      .ilike("code", normalizedCode)
      .maybeSingle()

    if (couponError || !coupon) {
      return NextResponse.json({ message: "Cupón no encontrado" }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ message: "El cupón no está activo" }, { status: 400 })
    }

    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ message: "El cupón aún no es válido" }, { status: 400 })
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return NextResponse.json({ message: "El cupón ha expirado" }, { status: 400 })
    }

    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("quantity, products(price)")
      .eq("cart_id", cartId)

    if (itemsError) {
      return NextResponse.json({ message: "No se pudieron obtener los productos" }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: "El carrito está vacío" }, { status: 400 })
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const relatedProduct = Array.isArray(item.products) ? item.products[0] : item.products
      const price = parseNumber(relatedProduct?.price)
      return sum + price * parseNumber(item.quantity)
    }, 0)

    const minSubtotal = parseNumber(coupon.min_subtotal)
    const maxSubtotal = coupon.max_subtotal !== null ? parseNumber(coupon.max_subtotal) : null

    if (subtotal < minSubtotal) {
      return NextResponse.json(
        { message: "El subtotal no cumple el mínimo para este cupón" },
        { status: 400 }
      )
    }

    if (maxSubtotal !== null && subtotal > maxSubtotal) {
      return NextResponse.json(
        { message: "El subtotal excede el máximo permitido para este cupón" },
        { status: 400 }
      )
    }

    let discount = 0
    const discountValue = parseNumber(coupon.discount_value)

    if (coupon.discount_type === "percentage") {
      discount = subtotal * (discountValue / 100)
    } else {
      discount = discountValue
    }

    discount = Math.min(discount, subtotal)

    if (discount <= 0) {
      return NextResponse.json(
        { message: "El cupón no aplica descuento para este carrito" },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        discount_amount: discount,
      })
      .eq("id", cartId)

    if (updateError) {
      return NextResponse.json(
        { message: "No se pudo aplicar el cupón" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      couponCode: coupon.code,
      discountAmount: discount,
      message: coupon.description || "Cupón aplicado correctamente",
    })
  } catch (error) {
    console.error("Error applying coupon:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { cartId } = await request.json()

    if (!cartId) {
      return NextResponse.json({ message: "Carrito requerido" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, user_id")
      .eq("id", cartId)
      .single()

    if (cartError || !cart) {
      return NextResponse.json({ message: "Carrito no encontrado" }, { status: 404 })
    }

    if (cart.user_id !== user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        coupon_id: null,
        coupon_code: null,
        discount_amount: 0,
      })
      .eq("id", cartId)

    if (updateError) {
      return NextResponse.json(
        { message: "No se pudo eliminar el cupón" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing coupon:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
