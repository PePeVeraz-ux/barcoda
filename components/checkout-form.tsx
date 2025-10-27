"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CheckoutFormProps {
  cartId: string
  cartItems: any[]
  total: number
}

export function CheckoutForm({ cartId, cartItems, total }: CheckoutFormProps) {
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart items
      const { error: clearError } = await supabase.from("cart_items").delete().eq("cart_id", cartId)

      if (clearError) throw clearError

      // Prepare WhatsApp message
      const productsText = cartItems
        .map(
          (item) =>
            `- ${item.products.name} x${item.quantity} ($${(Number(item.products.price) * item.quantity).toFixed(2)})`
        )
        .join("\n")

      const whatsappMessage = encodeURIComponent(
        `¡Hola! Quiero confirmar mi pedido:\n\n` +
          `📦 Orden #${order.id.slice(0, 8)}\n` +
          `💰 Total: $${total.toFixed(2)}\n\n` +
          `🛍️ Productos:\n${productsText}\n\n` +
          `📍 Datos de envío:\n` +
          `Nombre: ${fullName}\n` +
          `Dirección: ${address}\n` +
          `Ciudad: ${city}\n` +
          `Código Postal: ${postalCode}\n` +
          `Teléfono: ${phone}`
      )

      // WhatsApp number (configure in environment variables)
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491234567890"

      toast({
        title: "Orden creada",
        description: "Serás redirigido a WhatsApp para confirmar el pago",
      })

      // Redirect to WhatsApp
      setTimeout(() => {
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank")
        router.push("/orders")
        // No usar router.refresh() para evitar que el navbar pierda estado
      }, 1500)
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu orden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Envío</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              placeholder="Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Calle Principal 123"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                placeholder="12345"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Método de Pago</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Por el momento, solo aceptamos pago contra entrega. Podrás pagar en efectivo o con tarjeta cuando recibas
              tu pedido.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Confirmar Pedido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
