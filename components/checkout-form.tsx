"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CheckoutFormProps {
  cartId: string
}

export function CheckoutForm({ cartId }: CheckoutFormProps) {
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          fullName,
          address,
          city,
          postalCode,
          phone,
        }),
      })

      if (response.status === 401) {
        router.push("/auth/login")
        return
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 && Array.isArray(data.issues)) {
          const issueMessages = data.issues
            .map((issue: any) => `${issue.productName}: solicitaste ${issue.requested}, disponibles: ${issue.available}`)
            .join(" | ")

          toast({
            title: "Stock insuficiente",
            description: issueMessages,
            variant: "destructive",
          })

          setTimeout(() => {
            router.push("/cart")
          }, 2000)
          return
        }

        toast({
          title: "Error",
          description: data?.message || "No se pudo procesar tu orden",
          variant: "destructive",
        })
        return
      }

      const whatsappNumber: string = data.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491234567890"
      const whatsappMessage: string = data.whatsappMessage

      toast({
        title: "Orden creada",
        description: "Serás redirigido a WhatsApp para confirmar el pago",
      })

      setTimeout(() => {
        if (whatsappMessage) {
          window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank")
        }
        window.dispatchEvent(new Event('cart-updated'))
        router.push("/orders")
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
