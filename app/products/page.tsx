import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*")

  let query = supabase.from("products").select("*, categories(name, slug)")

  if (params.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", params.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  const selectedCategory = categories?.find((c) => c.slug === params.category)

  return (
    <div className="min-h-screen">

      <div className="container py-6 md:py-8">
        <div className="mb-6 md:mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {selectedCategory ? selectedCategory.name : "Todos los Productos"}
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground">
            {selectedCategory
              ? `Explora nuestra colección de ${selectedCategory.name}`
              : "Descubre nuestra colección completa de figuras de acción"}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 md:mb-8 flex flex-wrap gap-2 animate-fade-in animate-delay-100">
          <Button variant={!params.category ? "default" : "outline"} asChild size="sm" className="md:size-default">
            <Link href="/products">Todas</Link>
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={params.category === category.slug ? "default" : "outline"}
              asChild
              size="sm"
              className="md:size-default"
            >
              <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
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
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center animate-fade-in">
            <p className="text-xl font-semibold">No se encontraron productos</p>
            <p className="mt-2 text-muted-foreground">Intenta con otra categoría</p>
            <Button className="mt-6" asChild>
              <Link href="/products">Ver Todos los Productos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
