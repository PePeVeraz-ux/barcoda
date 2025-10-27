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
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { MultiImageUpload } from "@/components/multi-image-upload"

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
  images: string[] | null
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
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [categoryId, setCategoryId] = useState(product?.category_id || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        })
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl("")
  }

  const uploadImageToCloudflare = async (file: File): Promise<string> => {
    const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
    
    console.log("🔧 Worker URL:", workerUrl)
    
    if (!workerUrl) {
      throw new Error("URL del Worker de Cloudflare no configurada. Agrega NEXT_PUBLIC_CLOUDFLARE_WORKER_URL a tu .env.local")
    }

    const formData = new FormData()
    formData.append('file', file)
    
    console.log("📤 Enviando archivo:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    const response = await fetch(`${workerUrl}/upload`, {
      method: 'POST',
      body: formData,
    })

    console.log("📥 Respuesta del Worker:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Error al subir imagen',
        message: `HTTP ${response.status}: ${response.statusText}` 
      }))
      console.error("❌ Error del Worker:", errorData)
      throw new Error(errorData.error || errorData.message || 'Error al subir imagen')
    }

    const data = await response.json()
    console.log("✅ Respuesta exitosa del Worker:", data)
    
    if (!data.url) {
      throw new Error("El Worker no devolvió una URL válida")
    }
    
    return data.url // URL pública de la imagen en R2
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalImageUrl = imageUrl

      // Si hay una imagen nueva, subirla primero
      if (imageFile) {
        setUploadProgress(true)
        console.log("📤 Subiendo imagen al bucket...")
        try {
          finalImageUrl = await uploadImageToCloudflare(imageFile)
          console.log("✅ Imagen subida:", finalImageUrl)
          toast({
            title: "Imagen subida",
            description: "La imagen se subió correctamente",
          })
        } catch (error) {
          console.error("❌ Error al subir imagen:", error)
          throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        } finally {
          setUploadProgress(false)
        }
      }

      console.log("💾 Guardando producto en Supabase...")
      const productData = {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        image_url: finalImageUrl || (images.length > 0 ? images[0] : null),
        images: images.length > 0 ? images : null,
        category_id: categoryId || null,
        stock: Number.parseInt(stock),
      }
      console.log("📦 Datos del producto:", productData)

      if (product) {
        // Update existing product
        console.log("🔄 Actualizando producto existente...")
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) {
          console.error("❌ Error de Supabase:", error)
          throw error
        }

        console.log("✅ Producto actualizado")
        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        })
      } else {
        // Create new product
        console.log("➕ Creando nuevo producto...")
        
        // Agregar timeout para detectar si se congela
        const insertPromise = supabase.from("products").insert(productData)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La inserción tardó más de 10 segundos')), 10000)
        )
        
        const { error, data } = await Promise.race([insertPromise, timeoutPromise]) as any

        if (error) {
          console.error("❌ Error de Supabase:", error)
          console.error("❌ Código de error:", error.code)
          console.error("❌ Detalles:", error.details)
          console.error("❌ Hint:", error.hint)
          console.error("❌ Message:", error.message)
          throw error
        }

        console.log("✅ Producto creado:", data)
        toast({
          title: "Producto creado",
          description: "El producto se creó correctamente",
        })
      }

      console.log("🔄 Redirigiendo a lista de productos...")
      router.push("/admin/products")
      // No usar router.refresh() para evitar que el navbar pierda estado
    } catch (error) {
      console.error("❌ Error completo:", error)
      const errorMessage = error instanceof Error ? error.message : "No se pudo guardar el producto"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(false)
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

          {/* Componente de múltiples imágenes */}
          <MultiImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

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
