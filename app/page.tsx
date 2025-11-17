import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollSection } from "@/components/scroll-section"
import { Marquee } from "@/components/marquee"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").limit(10)

  const { data: allProducts } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen">
      <Marquee className="bg-gradient-to-r from-red-600 via-zinc-900 to-red-600 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white md:text-sm">
        🎉 Buen Fin 2025: descuentos especiales en figuras seleccionadas | Promoción válida solo por tiempo limitado | ¡Aprovecha antes de que se agoten! 🎉
      </Marquee>
      {/* marquee */}
      <Marquee className="bg-background py-2 text-sm text-foreground">
        <p>
          Envios a todo México | Costo de envio $160MXN por hasta un kilo de peso | Entregas personales los domingos en
          Mundo Divertido (Tijuana)
        </p>
      </Marquee>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-16 md:py-24 lg:py-32">
        {/* Background Image with Zoom-out Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-background/90 z-20 animate-hero-overlay" />
          <div className="absolute inset-0 bg-[url('/wallp.jpg')] bg-cover bg-center animate-hero-zoom-out" style={{ transformOrigin: 'center center' }} />
        </div>
        
        <div className="container relative z-20">
          <div className="mx-auto max-w-3xl text-center animate-hero-content">
            {/* Título */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Las Mejores Figuras de Acción
            </h1>
            
            {/* Botones (Ver Productos y Contacto whatsapp botones separados) */}
            <div className="mt-8 md:mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/products">
                  Ver Productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" asChild>
                <Link href="https://wa.me/526647691510">
                  Contactanos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
              <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">
                Cualquier duda, contactanos.
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
                  salePrice={product.sale_price}
                  saleActive={product.sale_active}
                  salePercentage={product.sale_percentage}
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>
    </div>
  )
}
