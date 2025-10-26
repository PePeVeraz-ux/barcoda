import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { ProductForm } from "@/components/product-form"
import { redirect } from "next/navigation"

export default async function NewProductPage() {
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

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="mt-2 text-lg text-muted-foreground">Agrega un nuevo producto a tu inventario</p>
        </div>

        <ProductForm categories={categories || []} />
      </div>
    </div>
  )
}
