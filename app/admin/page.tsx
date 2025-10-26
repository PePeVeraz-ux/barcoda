import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminPage() {
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

  // Get statistics
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { data: orders } = await supabase.from("orders").select("total")

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="mt-2 text-lg text-muted-foreground">Gestiona tu tienda de figuras de acción</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productsCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  Agregar Nuevo Producto
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  Gestionar Productos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Órdenes
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{order.profiles?.email}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                      <p className="text-sm font-bold">${Number(order.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay órdenes recientes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
