import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SearchX } from "lucide-react"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q || ""
  
  const supabase = await createClient()

  let products: any[] = []

  if (query.trim()) {
    // Buscar en nombre y descripción del producto
    const { data } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    products = data || []
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Resultados de búsqueda
          </h1>
          {query && (
            <p className="mt-2 text-lg text-muted-foreground">
              Mostrando {products.length} resultado(s) para "{query}"
            </p>
          )}
        </div>
      </section>

      <div className="container py-8">
        {!query.trim() ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">Ingresa un término de búsqueda</p>
            <p className="mt-2 text-muted-foreground">
              Usa la barra de búsqueda para encontrar productos
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold">No se encontraron productos</p>
            <p className="mt-2 text-muted-foreground">
              Intenta con otro término de búsqueda o explora nuestras categorías
            </p>
            <Button className="mt-6" asChild>
              <Link href="/products">Ver Todos los Productos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
