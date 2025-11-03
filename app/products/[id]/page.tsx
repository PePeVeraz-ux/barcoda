import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ScrollSection } from "@/components/scroll-section"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase.from("products").select("*, categories(name, slug)").eq("id", id).single()

  if (!product) {
    notFound()
  }

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", id)
    .limit(4)

  return (
    <div className="min-h-screen">

      <div className="container py-8">
        <Breadcrumbs
          items={[
            { label: "Productos", href: "/products" },
            { label: product.categories?.name || "Categoría", href: `/products?category=${product.categories?.slug}` },
            { label: product.name },
          ]}
          className="mb-6"
        />

        <Button variant="ghost" asChild className="mb-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>

        <ScrollSection animation="fade">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images Gallery */}
            <div className="relative">
              <ProductImageGallery 
                images={product.images && product.images.length > 0 ? product.images : [product.image_url || "/placeholder.svg"]}
                productName={product.name}
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                  <span className="text-2xl font-bold text-white">Agotado</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <Badge variant="secondary">{product.categories?.name}</Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
              <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
              </p>

              <div className="mt-6 space-y-4">
                <AddToCartButton productId={product.id} stock={product.stock} />
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/products">Seguir Comprando</Link>
                </Button>
              </div>

              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-semibold">Descripción</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {product.description || "Figura de acción de alta calidad con detalles excepcionales."}
                </p>
              </div>

              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-semibold mb-4">Características</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Múltiples puntos de articulación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Accesorios incluidos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Material de alta calidad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Empaque coleccionable</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollSection>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <ScrollSection animation="slide-up">
            <div className="mt-16">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Productos Relacionados</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="group overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-primary">${relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollSection>
        )}
      </div>
    </div>
  )
}
