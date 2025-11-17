import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SaleManager } from "@/components/admin/sale-manager"

export default async function AdminSalesPage() {
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

  const { data: categories } = await supabase.from("categories").select("id, name").order("name")

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock, category_id, sale_active, sale_price, sale_percentage, sale_applied_at, categories(name)")
    .order("created_at", { ascending: false })

  const formattedProducts = (products || []).map((product) => ({
    ...product,
    categories: Array.isArray(product.categories) ? product.categories[0] ?? null : product.categories,
  }))

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <SaleManager categories={categories || []} products={formattedProducts} />
      </div>
    </div>
  )
}
