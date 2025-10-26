"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  stock: number
}

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")
  const [categoryId, setCategoryId] = useState(product?.category_id || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        image_url: imageUrl || null,
        category_id: categoryId || null,
        stock: Number.parseInt(stock),
      }

      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) throw error

        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        })
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert(productData)

        if (error) throw error

        toast({
          title: "Producto creado",
          description: "El producto se creó correctamente",
        })
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              placeholder="Ej: Spider-Man Classic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el producto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Deja en blanco para usar imagen placeholder</p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
            </Button>
            <Button type="button" variant="outline" asChild className="bg-transparent">
              <Link href="/admin/products">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
