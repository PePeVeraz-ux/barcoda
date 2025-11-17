interface CartApiError {
  error?: string
  message?: string
}

export interface CartProduct {
  id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  sale_price?: number | null
  sale_active?: boolean
  weight?: number | null
}

export interface CartItem {
  id: string
  quantity: number
  cart_id: string
  product_id: string
  created_at?: string
  products: CartProduct
}

export interface CartSnapshot {
  cartId: string | null
  items: CartItem[]
  subtotal: number
  discount: number
  couponCode: string
  itemCount: number
}

export class CartServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "CartServiceError"
    this.status = status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & CartApiError

  if (!response.ok) {
    const error = data?.message || data?.error || "Error al procesar la solicitud del carrito"
    throw new CartServiceError(error, response.status)
  }

  return data as T
}

export async function addCartItem(productId: string) {
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  })

  return handleResponse<{ success: boolean }>(response)
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  })

  return handleResponse<{ success: boolean }>(response)
}

export async function deleteCartItem(itemId: string) {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  })

  return handleResponse<{ success: boolean }>(response)
}

export async function fetchCartSnapshot() {
  const response = await fetch("/api/cart", {
    credentials: "include",
  })

  return handleResponse<CartSnapshot>(response)
}
