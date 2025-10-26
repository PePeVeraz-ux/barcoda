import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusSelect } from "@/components/order-status-select"
import { redirect } from "next/navigation"
import { Package } from "lucide-react"

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

  // Obtener TODAS las órdenes (admin debe ver todas)
  const { data: orders, error: ordersError, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  console.log("📊 Órdenes obtenidas:", {
    total: count,
    ordersLength: orders?.length,
    error: ordersError,
    adminId: user.id
  })

  // Obtener perfiles de los usuarios que hicieron órdenes
  let ordersWithProfiles = orders
  if (orders && orders.length > 0) {
    const userIds = [...new Set(orders.map(order => order.user_id))]
    
    console.log("👥 User IDs únicos:", userIds.length)
    
    ordersWithProfiles = orders.map(order => ({
      ...order,
      userEmail: `Usuario ${order.user_id.slice(0, 8)}`,
      userIdFull: order.user_id
    }))
  }

  if (ordersError) {
    console.error("❌ Error al obtener órdenes:", {
      message: ordersError.message,
      code: ordersError.code,
      details: ordersError.details,
      hint: ordersError.hint
    })
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
            <div className="flex items-center justify-between">
              <CardTitle>Todas las Órdenes ({ordersWithProfiles?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {ordersError && (
              <div className="text-center py-8 text-destructive">
                <p>Error al cargar órdenes: {ordersError.message}</p>
                <p className="text-sm mt-2">Código: {ordersError.code}</p>
              </div>
            )}
            
            {!ordersError && ordersWithProfiles && ordersWithProfiles.length > 0 ? (
              <div className="space-y-4">
                {ordersWithProfiles.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">Orden #{order.id.slice(0, 8)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !ordersError ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay órdenes todavía</p>
                <p className="text-sm text-muted-foreground mt-2">Las órdenes de los clientes aparecerán aquí</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
