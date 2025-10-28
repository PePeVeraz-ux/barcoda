import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/product-form"
import { redirect, notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-muted/30">

      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Editar Producto</h1>
          <p className="mt-2 text-lg text-muted-foreground">Actualiza la información del producto</p>
        </div>

        <ProductForm categories={categories || []} product={product} />
      </div>
    </div>
  )
}
