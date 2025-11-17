import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Acceso restringido" }, { status: 403 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string
      description?: string | null
      price?: number
      image_url?: string | null
      images?: string[] | null
      category_id?: string | null
      stock?: number
    }

    if (!body.name || typeof body.price !== "number" || Number.isNaN(body.price)) {
      return NextResponse.json({ error: "Nombre y precio son obligatorios" }, { status: 400 })
    }

    const stockValue = typeof body.stock === "number" && !Number.isNaN(body.stock) ? body.stock : 0

    const payload = {
      name: body.name.trim(),
      description: body.description ?? null,
      price: Number(body.price),
      image_url: body.image_url ?? null,
      images: body.images ?? null,
      category_id: body.category_id ?? null,
      stock: stockValue,
    }

    const { data, error } = await supabase.from("products").insert(payload).select("id").single()

    if (error || !data) {
      console.error("Error inserting product:", error)
      return NextResponse.json({ error: "No se pudo crear el producto" }, { status: 500 })
    }

    return NextResponse.json({ success: true, productId: data.id }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/admin/products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
