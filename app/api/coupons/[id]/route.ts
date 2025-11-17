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

  return { supabase }
}

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDate(value: unknown) {
  if (!value) {
    return null
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase } = admin

  const couponId = params.id

  if (!couponId) {
    return NextResponse.json({ message: "ID de cupón requerido" }, { status: 400 })
  }

  try {
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.code !== undefined) {
      const code = String(body.code || "").trim().toUpperCase()
      if (!code) {
        return NextResponse.json({ message: "El código es requerido" }, { status: 400 })
      }
      updateData.code = code
    }

    if (body.description !== undefined) {
      updateData.description = typeof body.description === "string" ? body.description.trim() || null : null
    }

    if (body.discountType !== undefined) {
      if (body.discountType !== "percentage" && body.discountType !== "fixed") {
        return NextResponse.json({ message: "Tipo de descuento inválido" }, { status: 400 })
      }
      updateData.discount_type = body.discountType
    }

    if (body.discountValue !== undefined) {
      const discountValue = Number(body.discountValue)
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return NextResponse.json({ message: "El valor del descuento debe ser mayor a cero" }, { status: 400 })
      }
      if (updateData.discount_type === "percentage" || body.discountType === "percentage") {
        if (discountValue <= 0 || discountValue > 100) {
          return NextResponse.json({ message: "Los porcentajes deben estar entre 0 y 100" }, { status: 400 })
        }
      }
      updateData.discount_value = discountValue
    }

    if (body.minSubtotal !== undefined) {
      const minSubtotal = Number(body.minSubtotal)
      if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
        return NextResponse.json({ message: "El subtotal mínimo no puede ser negativo" }, { status: 400 })
      }
      updateData.min_subtotal = minSubtotal
    }

    if (body.maxSubtotal !== undefined) {
      const maxSubtotal = parseNumber(body.maxSubtotal)
      if (body.maxSubtotal !== null && maxSubtotal === null) {
        return NextResponse.json({ message: "El subtotal máximo es inválido" }, { status: 400 })
      }
      updateData.max_subtotal = maxSubtotal
    }

    if (body.active !== undefined) {
      updateData.active = Boolean(body.active)
    }

    if (body.validFrom !== undefined) {
      updateData.valid_from = parseDate(body.validFrom)
    }

    if (body.validTo !== undefined) {
      updateData.valid_to = parseDate(body.validTo)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No se enviaron cambios" }, { status: 400 })
    }

    if (
      (updateData.min_subtotal !== undefined || updateData.max_subtotal !== undefined) &&
      (updateData.min_subtotal !== null || updateData.max_subtotal !== null)
    ) {
      const minSubtotal = updateData.min_subtotal ?? body.minSubtotal
      const maxSubtotal = updateData.max_subtotal ?? body.maxSubtotal
      if (typeof minSubtotal === "number" && typeof maxSubtotal === "number" && maxSubtotal < minSubtotal) {
        return NextResponse.json({ message: "El subtotal máximo no puede ser menor al mínimo" }, { status: 400 })
      }
    }

    if (updateData.valid_from && updateData.valid_to) {
      if (new Date(String(updateData.valid_from)) > new Date(String(updateData.valid_to))) {
        return NextResponse.json({ message: "La fecha inicial no puede ser posterior a la final" }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", couponId)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "El código ya existe" }, { status: 409 })
      }
      console.error("Error updating coupon:", error)
      return NextResponse.json({ message: "No se pudo actualizar el cupón" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ message: "Cupón no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ coupon: data })
  } catch (error) {
    console.error("Unexpected error updating coupon:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (admin.error) {
    return admin.error
  }
  const { supabase } = admin

  const couponId = params.id

  if (!couponId) {
    return NextResponse.json({ message: "ID de cupón requerido" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("coupons").delete().eq("id", couponId)

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json({ message: "El cupón está en uso y no puede eliminarse" }, { status: 409 })
      }
      console.error("Error deleting coupon:", error)
      return NextResponse.json({ message: "No se pudo eliminar el cupón" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error deleting coupon:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
