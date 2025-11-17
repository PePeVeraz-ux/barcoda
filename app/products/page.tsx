import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { ProductsFilters } from "@/components/products-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package } from "lucide-react"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string
    sort?: string
    inStock?: string
    minPrice?: string
    maxPrice?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*")

  let query = supabase.from("products").select("*, categories(name, slug, hero_image)")

  // Filtro de categoría
  if (params.category && params.category !== "all") {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", params.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  // Filtro de stock
  if (params.inStock === "true") {
    query = query.gt("stock", 0)
  }

  // Filtro de precio
  if (params.minPrice) {
    query = query.gte("price", Number(params.minPrice))
  }
  if (params.maxPrice) {
    query = query.lte("price", Number(params.maxPrice))
  }

  // Ordenamiento
  const sortOption = params.sort || "newest"
  switch (sortOption) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name-asc":
      query = query.order("name", { ascending: true })
      break
    case "name-desc":
      query = query.order("name", { ascending: false })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: products } = await query

  const selectedCategory = categories?.find((c) => c.slug === params.category)

  return (
    <div className="min-h-screen">
      {/* Hero Section - Key cambia con categoría para re-animar */}
      <section key={params.category || 'all'} className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-12 md:py-16 lg:py-20">
        {/* Background Image with Zoom-out Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-background/90 z-10 animate-hero-overlay" />
          <div 
            className="absolute inset-0 bg-cover bg-center animate-hero-zoom-out" 
            style={{ 
              backgroundImage: `url('${selectedCategory?.hero_image || '/wallp.jpg'}')`,
              transformOrigin: 'center center' 
            }} 
          />
        </div>
        
        <div className="container relative z-20">
          <div className="max-w-3xl animate-hero-content">
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Package className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">
                {selectedCategory ? selectedCategory.name : "Catálogo Completo"}
              </span>
            </div>
            
            {/* Título */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {selectedCategory ? selectedCategory.name : "Todos los Productos"}
            </h1>
            
            {/* Descripción */}
            <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">
              {selectedCategory
                ? `Explora nuestra colección de ${selectedCategory.name}`
                : "Descubre nuestra colección completa de figuras de acción"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filters - Desktop */}
          <aside className="space-y-4">
            <ProductsFilters categories={categories || []} />
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Products Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {products?.length || 0} producto(s) encontrado(s)
              </p>
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      imageUrl={product.image_url}
                      stock={product.stock}
                      salePrice={product.sale_price}
                      saleActive={product.sale_active}
                      salePercentage={product.sale_percentage}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center animate-fade-in">
                <p className="text-xl font-semibold">No se encontraron productos</p>
                <p className="mt-2 text-muted-foreground">Intenta ajustar los filtros</p>
                <Button className="mt-6" asChild>
                  <Link href="/products">Ver Todos los Productos</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
