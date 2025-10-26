import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"
import { DeleteProductButton } from "@/components/delete-product-button"

export default async function AdminProductsPage() {
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

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Gestionar Productos</h1>
            <p className="mt-2 text-lg text-muted-foreground">Administra el inventario de tu tienda</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.categories?.name}</p>
                      <div className="mt-1 flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                        <span className="text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay productos todavía</p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Producto
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
