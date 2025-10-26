import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(email)")
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
          <h1 className="text-4xl font-bold tracking-tight">Gestionar Órdenes</h1>
          <p className="mt-2 text-lg text-muted-foreground">Administra todas las órdenes de la tienda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">Orden #{order.id.slice(0, 8)}</p>
                        <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay órdenes todavía</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
