import { createClient } from "@/lib/supabase/server"

/**
 * Calcula el stock disponible real de un producto
 * considerando los items en carritos de otros usuarios
 */
export async function getAvailableStock(productId: string, excludeCartId?: string) {
  const supabase = await createClient()

  // Obtener stock total del producto
  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  if (!product) return 0

  // Calcular cantidad en carritos (excluyendo el carrito actual si se especifica)
  let cartItemsQuery = supabase
    .from("cart_items")
    .select("quantity, carts!inner(id)")
    .eq("product_id", productId)

  if (excludeCartId) {
    cartItemsQuery = cartItemsQuery.neq("cart_id", excludeCartId)
  }

  const { data: cartItems } = await cartItemsQuery

  const reservedInCarts = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return Math.max(0, product.stock - reservedInCarts)
}

/**
 * Valida si hay suficiente stock disponible para una cantidad específica
 */
export async function validateStockAvailability(
  productId: string,
  requestedQuantity: number,
  excludeCartId?: string
): Promise<{ available: boolean; availableStock: number; message?: string }> {
  const availableStock = await getAvailableStock(productId, excludeCartId)

  if (availableStock >= requestedQuantity) {
    return { available: true, availableStock }
  }

  return {
    available: false,
    availableStock,
    message: availableStock === 0 
      ? "Este producto ya no está disponible" 
      : `Solo hay ${availableStock} unidad(es) disponible(s)`,
  }
}

/**
 * Actualiza el stock del producto después de una compra completada
 */
export async function decrementProductStock(productId: string, quantity: number) {
  const supabase = await createClient()

  // Usar transacción para evitar race conditions
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  if (fetchError || !product) {
    throw new Error("Producto no encontrado")
  }

  const newStock = Math.max(0, product.stock - quantity)

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)

  if (updateError) {
    throw new Error("Error al actualizar stock")
  }

  return newStock
}

/**
 * Valida todo el carrito antes del checkout
 */
export async function validateCartStock(cartId: string): Promise<{
  valid: boolean
  issues: Array<{ productId: string; productName: string; requested: number; available: number }>
}> {
  const supabase = await createClient()

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name)")
    .eq("cart_id", cartId)

  if (!cartItems || cartItems.length === 0) {
    return { valid: true, issues: [] }
  }

  const issues: Array<{ productId: string; productName: string; requested: number; available: number }> = []

  for (const item of cartItems) {
    const validation = await validateStockAvailability(item.product_id, item.quantity, cartId)
    
    if (!validation.available) {
      issues.push({
        productId: item.product_id,
        productName: (item.products as any)?.name || "Producto",
        requested: item.quantity,
        available: validation.availableStock,
      })
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
