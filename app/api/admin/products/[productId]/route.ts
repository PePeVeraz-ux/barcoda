import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{ productId: string }>
}

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, status: 401 as const }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { supabase, status: 403 as const }
  }

  return { supabase, status: 200 as const }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params

  if (!productId) {
    return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
  }

  const adminCheck = await ensureAdmin()

  if (adminCheck.status !== 200) {
    const message = adminCheck.status === 401 ? "No autorizado" : "Acceso restringido"
    return NextResponse.json({ error: message }, { status: adminCheck.status })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string
      description?: string | null
      price?: number
      image_url?: string | null
      images?: string[] | null
      category_id?: string | null
      stock?: number
    }

    const payload: Record<string, unknown> = {}

    if (typeof body.name === "string") payload.name = body.name.trim()
    if ("description" in body) payload.description = body.description ?? null
    if (typeof body.price === "number" && !Number.isNaN(body.price)) payload.price = Number(body.price)
    if ("image_url" in body) payload.image_url = body.image_url ?? null
    if ("images" in body) payload.images = body.images ?? null
    if ("category_id" in body) payload.category_id = body.category_id ?? null
    if (typeof body.stock === "number" && !Number.isNaN(body.stock)) payload.stock = Math.max(0, Math.trunc(body.stock))

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No se enviaron campos para actualizar" }, { status: 400 })
    }

    const { error } = await adminCheck.supabase.from("products").update(payload).eq("id", productId)

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/admin/products/[productId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { productId } = await context.params

  if (!productId) {
    return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
  }

  const adminCheck = await ensureAdmin()

  if (adminCheck.status !== 200) {
    const message = adminCheck.status === 401 ? "No autorizado" : "Acceso restringido"
    return NextResponse.json({ error: message }, { status: adminCheck.status })
  }

  try {
    const { error } = await adminCheck.supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/products/[productId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
