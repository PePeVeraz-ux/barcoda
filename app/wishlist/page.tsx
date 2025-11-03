import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export default async function WishlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: wishlistItems } = await supabase
    .from("wishlist_items")
    .select("*, products(*, categories(name, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const products = wishlistItems?.map(item => item.products).filter(Boolean) || []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mis Favoritos</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {products.length} {products.length === 1 ? "producto" : "productos"} guardados
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {products.length > 0 ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any, index: number) => (
              <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">No tienes favoritos aún</p>
            <p className="mt-2 text-muted-foreground mb-6">
              Explora nuestros productos y marca tus favoritos haciendo clic en el corazón
            </p>
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
