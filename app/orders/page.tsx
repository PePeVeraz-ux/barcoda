import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
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
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "shipped":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
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
      <Navbar />

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
                  <div className="space-y-3">
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
