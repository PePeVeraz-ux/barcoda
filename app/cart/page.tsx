import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CartContent } from "@/components/cart-content"
import type { CartSnapshot } from "@/lib/services/cart-service"

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const entries = cookieStore.getAll()
  if (!entries.length) return ""
  return entries.map(({ name, value }) => `${name}=${value}`).join("; ")
}

function resolveBaseUrl(headersList: Awaited<ReturnType<typeof headers>>) {
  const protocol = headersList.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https")
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host")

  if (!host) {
    throw new Error("No se pudo determinar el host para construir la URL base")
  }

  return `${protocol}://${host}`
}

export default async function CartPage() {
  const headersList = await headers()
  const cookieStore = await cookies()

  const baseUrl = resolveBaseUrl(headersList)
  const cookieHeader = buildCookieHeader(cookieStore)
  const response = await fetch(`${baseUrl}/api/cart`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  })

  if (response.status === 401) {
    redirect("/auth/login")
  }

  if (!response.ok) {
    throw new Error("No se pudo obtener la información del carrito")
  }

  const snapshot = (await response.json()) as CartSnapshot

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Carrito de Compras</h1>
          <p className="mt-2 text-lg text-muted-foreground">Revisa tus productos antes de finalizar la compra</p>
        </div>

        <CartContent initialSnapshot={snapshot} />
      </div>
    </div>
  )
}
