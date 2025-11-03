import { NextRequest, NextResponse } from "next/server"
import { validateCartStock } from "@/lib/inventory"

export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json()

    if (!cartId) {
      return NextResponse.json(
        { error: "cartId is required" },
        { status: 400 }
      )
    }

    const result = await validateCartStock(cartId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error validating cart stock:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
