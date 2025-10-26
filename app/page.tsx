import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollSection } from "@/components/scroll-section"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").limit(5)

  const { data: allProducts } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Las Mejores Figuras de Acción
            </h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-muted-foreground text-pretty animate-slide-up animate-delay-100">
              Descubre nuestra colección exclusiva de figuras de acción de tus personajes favoritos. Marvel, DC, Star
              Wars y más.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-slide-up animate-delay-200">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/products">
                  Ver Productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                <Link href="/auth/sign-up">Crear Cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <ScrollSection animation="slide-up">
        <section className="py-12 md:py-20 lg:py-24">
          <div className="container">
            <div className="mb-8 md:mb-12 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Explora por Categoría</h2>
              <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">
                Encuentra figuras de tus franquicias favoritas
              </p>
            </div>
            <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 md:p-6 transition-all hover:shadow-lg hover:border-primary hover-lift"
                >
                  <h3 className="text-base md:text-xl font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="mt-3 md:mt-4 h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* All Products Section */}
      <ScrollSection animation="slide-up">
        <section className="bg-muted/50 py-12 md:py-20 lg:py-24">
          <div className="container">
            <div className="mb-8 md:mb-12 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Nuestra Colección Completa</h2>
              <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">
                Explora todas nuestras figuras de acción disponibles
              </p>
            </div>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url}
                  stock={product.stock}
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Action Figures Store. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
