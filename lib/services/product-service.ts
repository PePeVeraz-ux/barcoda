interface ProductApiError {
  error?: string
  message?: string
}

export class ProductServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ProductServiceError"
    this.status = status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & ProductApiError

  if (!response.ok) {
    const message = data?.message || data?.error || "Error al procesar la solicitud del producto"
    throw new ProductServiceError(message, response.status)
  }

  return data as T
}

export interface ProductPayload {
  name: string
  description: string | null
  price: number
  image_url: string | null
  images: string[] | null
  category_id: string | null
  stock: number
}

export async function createProduct(payload: ProductPayload) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  return handleResponse<{ success: boolean; productId: string }>(response)
}

export async function updateProduct(productId: string, payload: ProductPayload) {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  return handleResponse<{ success: boolean }>(response)
}

export async function deleteProduct(productId: string) {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  })

  return handleResponse<{ success: boolean }>(response)
}
