import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

interface CartProduct {
  id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  sale_price?: number | null
  sale_active?: boolean
}

interface CartItemResponse {
  id: string
  quantity: number
  cart_id: string
  product_id: string
  created_at: string
  products: CartProduct
}

function getUnitPrice(product: CartProduct) {
  const basePrice = Number(product?.price) || 0
  const salePrice = Number(product?.sale_price)
  const hasValidSale = Boolean(
    product?.sale_active &&
      Number.isFinite(salePrice) &&
      salePrice > 0 &&
      salePrice < basePrice,
  )

  const price = hasValidSale ? salePrice : basePrice
  return Number(price.toFixed(2))
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, coupon_code, discount_amount")
      .eq("user_id", user.id)
      .single()

    if (cartError && cartError.code !== "PGRST116") {
      console.error("Error fetching cart:", cartError)
      return NextResponse.json({ error: "No se pudo obtener el carrito" }, { status: 500 })
    }

    if (!cart) {
      return NextResponse.json({
        cartId: null,
        items: [] as CartItemResponse[],
        subtotal: 0,
        discount: 0,
        couponCode: "",
        itemCount: 0,
      })
    }

    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("id, quantity, cart_id, product_id, created_at, products(id, name, price, image_url, stock, sale_price, sale_active, weight)")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: false })

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError)
      return NextResponse.json({ error: "No se pudieron obtener los productos del carrito" }, { status: 500 })
    }

    const items = (cartItems || []).map((item) => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products,
    })) as CartItemResponse[]

    const subtotal = items.reduce((sum, item) => {
      const product = item.products
      return sum + getUnitPrice(product) * Number(item.quantity || 0)
    }, 0)

    const discount = Math.min(Number(cart.discount_amount) || 0, subtotal)
    const couponCode = cart.coupon_code || ""

    return NextResponse.json({
      cartId: cart.id,
      items,
      subtotal,
      discount,
      couponCode,
      itemCount: items.length,
    })
  } catch (error) {
    console.error("Error in GET /api/cart:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
