import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white hover:bg-yellow-600"
      case "processing":
        return "bg-blue-500 text-white hover:bg-blue-600"
      case "shipped":
        return "bg-purple-500 text-white hover:bg-purple-600"
      case "delivered":
        return "bg-green-500 text-white hover:bg-green-600"
      case "cancelled":
        return "bg-red-500 text-white hover:bg-red-600"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Mis Órdenes</h1>
          <p className="mt-2 text-lg text-muted-foreground">Revisa el estado de tus pedidos</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Orden #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                      <p className="text-xl font-bold text-primary mt-2">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Shipping Information */}
                    {order.shipping_name && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 text-sm">Información de Envío</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Nombre:</span> {order.shipping_name}</p>
                          <p><span className="text-muted-foreground">Dirección:</span> {order.shipping_address}</p>
                          <p><span className="text-muted-foreground">Ciudad:</span> {order.shipping_city}</p>
                          <p><span className="text-muted-foreground">C.P.:</span> {order.shipping_postal_code}</p>
                          <p><span className="text-muted-foreground">Teléfono:</span> {order.shipping_phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Items */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Productos</h3>
                      {order.order_items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">{item.products.name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No tienes órdenes</h2>
              <p className="text-muted-foreground mb-6">Comienza a comprar para ver tus pedidos aquí</p>
              <Button asChild>
                <Link href="/products">Explorar Productos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
