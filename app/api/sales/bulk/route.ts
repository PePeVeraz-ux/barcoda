import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type SaleScope = "all" | "category" | "products"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ message: "No autenticado" }, { status: 401 }) }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ message: "No autorizado" }, { status: 403 }) }
  }

  return { supabase, user }
}

function parsePercentage(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }
  return parsed
}

interface SaleRequestBody {
  scope?: SaleScope
  categoryId?: string | null
  productIds?: string[]
  percentage?: number
}

async function fetchProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  scope: SaleScope,
  categoryId?: string | null,
  productIds?: string[],
) {
  let query = supabase.from("products").select("id, price")

  if (scope === "category") {
    if (!categoryId) {
      return { data: null, error: NextResponse.json({ message: "categoryId requerido" }, { status: 400 }) }
    }
    query = query.eq("category_id", categoryId)
  }

  if (scope === "products") {
    if (!productIds || productIds.length === 0) {
      return { data: null, error: NextResponse.json({ message: "Se requieren productIds" }, { status: 400 }) }
    }
    query = query.in("id", productIds)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products for sale:", error)
    return { data: null, error: NextResponse.json({ message: "No se pudieron obtener los productos" }, { status: 500 }) }
  }

  if (!data || data.length === 0) {
    return { data: null, error: NextResponse.json({ message: "No se encontraron productos para el criterio dado" }, { status: 404 }) }
  }

  return { data, error: null as null }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase, user } = admin

  try {
    const body: SaleRequestBody = await request.json()
    const scope: SaleScope = body.scope || "all"
    const percentage = parsePercentage(body.percentage)

    if (percentage === null || percentage <= 0 || percentage >= 100) {
      return NextResponse.json({ message: "El porcentaje debe ser mayor a 0 y menor a 100" }, { status: 400 })
    }

    const { data: products, error } = await fetchProducts(supabase, scope, body.categoryId, body.productIds)
    if (error) return error
    if (!products) return NextResponse.json({ message: "No hay productos seleccionados" }, { status: 404 })

    const now = new Date().toISOString()

    let updatedCount = 0

    for (const product of products) {
      const salePrice = Number((Number(product.price) * (1 - percentage / 100)).toFixed(2))

      const { error: updateError } = await supabase
        .from("products")
        .update({
          sale_price: salePrice,
          sale_active: true,
          sale_applied_at: now,
          sale_applied_by: user.id,
          sale_percentage: percentage,
        })
        .eq("id", product.id)

      if (updateError) {
        console.error("Error applying sale:", updateError)
        return NextResponse.json(
          {
            message: "No se pudo aplicar la promoción",
            details: updateError.message ?? updateError.details,
          },
          { status: 500 },
        )
      }

      updatedCount += 1
    }

    return NextResponse.json({ success: true, updated: updatedCount })
  } catch (error) {
    console.error("Unexpected error applying sale:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase } = admin

  try {
    const body: SaleRequestBody = await request.json()
    const scope: SaleScope = body.scope || "all"

    const { data: products, error } = await fetchProducts(supabase, scope, body.categoryId, body.productIds)
    if (error) return error
    if (!products) return NextResponse.json({ message: "No hay productos seleccionados" }, { status: 404 })

    let revertedCount = 0

    for (const product of products) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          sale_price: null,
          sale_active: false,
          sale_applied_at: null,
          sale_applied_by: null,
          sale_percentage: null,
        })
        .eq("id", product.id)

      if (updateError) {
        console.error("Error reverting sale:", updateError)
        return NextResponse.json(
          {
            message: "No se pudo revertir la promoción",
            details: updateError.message ?? updateError.details,
          },
          { status: 500 },
        )
      }

      revertedCount += 1
    }

    return NextResponse.json({ success: true, updated: revertedCount })
  } catch (error) {
    console.error("Unexpected error reverting sale:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
