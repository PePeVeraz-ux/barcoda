import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseDate(value: unknown) {
  if (!value) {
    return null
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase } = admin

  const searchParams = new URL(request.url).searchParams
  const includeInactive = searchParams.get("includeInactive") === "true"

  let query = supabase.from("coupons").select("*").order("created_at", { ascending: false })

  if (!includeInactive) {
    query = query.eq("active", true)
  }

  const { data: coupons, error } = await query

  if (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ message: "No se pudieron obtener los cupones" }, { status: 500 })
  }

  return NextResponse.json({ coupons: coupons || [] })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase } = admin

  try {
    const body = await request.json()

    const code = String(body.code || "").trim().toUpperCase()
    const discountType = body.discountType === "percentage" ? "percentage" : body.discountType === "fixed" ? "fixed" : null
    const discountValue = parseNumber(body.discountValue)
    const minSubtotal = parseNumber(body.minSubtotal)
    const maxSubtotalInput = body.maxSubtotal
    const hasMaxSubtotal = maxSubtotalInput !== undefined && maxSubtotalInput !== null && maxSubtotalInput !== ""
    let maxSubtotal: number | null = null
    if (hasMaxSubtotal) {
      const parsedMax = Number(maxSubtotalInput)
      if (!Number.isFinite(parsedMax)) {
        return NextResponse.json({ message: "El subtotal máximo es inválido" }, { status: 400 })
      }
      maxSubtotal = parsedMax
    }
    const active = body.active !== undefined ? Boolean(body.active) : true
    const validFrom = parseDate(body.validFrom)
    const validTo = parseDate(body.validTo)
    const description = typeof body.description === "string" ? body.description.trim() || null : null

    if (!code) {
      return NextResponse.json({ message: "El código es requerido" }, { status: 400 })
    }

    if (!discountType) {
      return NextResponse.json({ message: "Tipo de descuento inválido" }, { status: 400 })
    }

    if (discountValue <= 0) {
      return NextResponse.json({ message: "El valor del descuento debe ser mayor a cero" }, { status: 400 })
    }

    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json({ message: "Los porcentajes deben estar entre 0 y 100" }, { status: 400 })
    }

    if (minSubtotal < 0) {
      return NextResponse.json({ message: "El subtotal mínimo no puede ser negativo" }, { status: 400 })
    }

    if (hasMaxSubtotal) {
      if (maxSubtotal === null) {
        return NextResponse.json({ message: "El subtotal máximo es inválido" }, { status: 400 })
      }
      if (maxSubtotal < minSubtotal) {
        return NextResponse.json({ message: "El subtotal máximo no puede ser menor al mínimo" }, { status: 400 })
      }
    }

    if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
      return NextResponse.json({ message: "La fecha inicial no puede ser posterior a la final" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code,
        description,
        discount_type: discountType,
        discount_value: discountValue,
        min_subtotal: minSubtotal,
        max_subtotal: maxSubtotal,
        active,
        valid_from: validFrom,
        valid_to: validTo,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "El código ya existe" }, { status: 409 })
      }
      console.error("Error creating coupon:", error)
      return NextResponse.json({ message: "No se pudo crear el cupón" }, { status: 500 })
    }

    return NextResponse.json({ coupon: data }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error creating coupon:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
