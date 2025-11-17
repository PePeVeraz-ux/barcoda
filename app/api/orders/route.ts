import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { calculateShipping } from "@/lib/shipping"
import { validateCartStock } from "@/lib/inventory"

function getUnitPrice(product: Record<string, any>) {
  const basePrice = Number(product?.price) || 0
  const salePrice = Number(product?.sale_price)
  const hasSale = Boolean(product?.sale_active && Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice)

  const price = hasSale ? salePrice : basePrice
  return Number(price.toFixed(2))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      cartId?: string
      fullName?: string
      address?: string
      city?: string
      postalCode?: string
      phone?: string
    }

    const cartId = body.cartId?.trim()
    const fullName = body.fullName?.trim()
    const address = body.address?.trim()
    const city = body.city?.trim()
    const postalCode = body.postalCode?.trim()
    const phone = body.phone?.trim()

    if (!cartId || !fullName || !address || !city || !postalCode || !phone) {
      return NextResponse.json({ message: "Datos de envío incompletos" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, user_id, coupon_id, coupon_code, discount_amount")
      .eq("id", cartId)
      .single()

    if (cartError || !cart) {
      return NextResponse.json({ message: "Carrito no encontrado" }, { status: 404 })
    }

    if (cart.user_id !== user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select(
        "id, product_id, quantity, created_at, products(id, name, price, stock, weight, sale_price, sale_active)"
      )
      .eq("cart_id", cartId)

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError)
      return NextResponse.json({ message: "No se pudieron obtener los productos del carrito" }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: "El carrito está vacío" }, { status: 400 })
    }

    const normalizedItems = cartItems.map((item) => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products,
    }))

    const stockValidation = await validateCartStock(cartId)

    if (!stockValidation.valid) {
      return NextResponse.json(
        {
          message: "Stock insuficiente",
          issues: stockValidation.issues,
        },
        { status: 409 }
      )
    }

    const subtotal = normalizedItems.reduce((sum, item) => {
      return sum + getUnitPrice(item.products) * Number(item.quantity || 0)
    }, 0)

    const rawDiscount = Number(cart.discount_amount) || 0
    const discount = Math.min(Math.max(rawDiscount, 0), subtotal)

    const shipping = calculateShipping(normalizedItems as any)
    const total = Math.max(0, subtotal - discount)

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        discount_amount: discount,
        total,
        shipping_cost: 0,
        shipping_weight: shipping.totalWeight,
        shipping_boxes: shipping.boxes,
        status: "pending",
        shipping_name: fullName,
        shipping_address: address,
        shipping_city: city,
        shipping_postal_code: postalCode,
        shipping_phone: phone,
        coupon_id: cart.coupon_id,
        coupon_code: cart.coupon_code,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ message: "No se pudo crear la orden" }, { status: 500 })
    }

    const orderItems = normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: getUnitPrice(item.products),
    }))

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

    if (orderItemsError) {
      console.error("Error inserting order items:", orderItemsError)
      return NextResponse.json({ message: "No se pudieron registrar los productos de la orden" }, { status: 500 })
    }

    for (const item of normalizedItems) {
      const currentStock = Number(item.products?.stock ?? 0)
      const newStock = Math.max(0, currentStock - Number(item.quantity || 0))

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id)

      if (stockError) {
        console.error(`Error updating stock for product ${item.product_id}:`, stockError)
        return NextResponse.json(
          { message: "No se pudo actualizar el stock de los productos" },
          { status: 500 }
        )
      }
    }

    const { error: clearError } = await supabase.from("cart_items").delete().eq("cart_id", cartId)

    if (clearError) {
      console.error("Error clearing cart items:", clearError)
      return NextResponse.json({ message: "No se pudo vaciar el carrito" }, { status: 500 })
    }

    const { error: resetError } = await supabase
      .from("carts")
      .update({ coupon_id: null, coupon_code: null, discount_amount: 0 })
      .eq("id", cartId)

    if (resetError) {
      console.error("Error resetting cart metadata:", resetError)
      return NextResponse.json({ message: "No se pudo reiniciar el carrito" }, { status: 500 })
    }

    const productsText = normalizedItems
      .map((item) => {
        const lineTotal = getUnitPrice(item.products) * Number(item.quantity || 0)
        return `- ${item.products?.name ?? "Producto"} x${item.quantity} ($${lineTotal.toFixed(2)})`
      })
      .join("\n")

    const whatsappMessage = encodeURIComponent(
      `¡Hola! Quiero confirmar mi pedido:\n\n` +
        `📦 Orden #${String(order.id).slice(0, 8)}\n\n` +
        `🛍️ Productos:\n${productsText}\n\n` +
        `💵 Resumen:\n` +
        `Subtotal: $${subtotal.toFixed(2)}\n` +
        (discount > 0 ? `Descuento: -$${discount.toFixed(2)}\n` : "") +
        `Total a pagar (sin envío): $${total.toFixed(2)}\n` +
        `El costo de envío se coordina por WhatsApp.\n\n` +
        `📍 Datos de envío:\n` +
        `Nombre: ${fullName}\n` +
        `Dirección: ${address}\n` +
        `Ciudad: ${city}\n` +
        `Código Postal: ${postalCode}\n` +
        `Teléfono: ${phone}`
    )

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491234567890"

    return NextResponse.json({
      orderId: order.id,
      subtotal,
      discount,
      total,
      shipping,
      whatsappNumber,
      whatsappMessage,
    })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
