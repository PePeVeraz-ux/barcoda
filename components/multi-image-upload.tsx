"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface MultiImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function MultiImageUpload({ images, onImagesChange, maxImages = 5 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Validar número máximo de imágenes
    if (images.length + files.length > maxImages) {
      toast({
        title: "Límite excedido",
        description: `Solo puedes subir hasta ${maxImages} imágenes`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Archivo inválido",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive",
          })
          continue
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Archivo muy grande",
            description: `${file.name} supera los 5MB`,
            variant: "destructive",
          })
          continue
        }

        // Subir a Cloudflare
        const url = await uploadToCloudflare(file)
        if (url) {
          uploadedUrls.push(url)
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls])
        toast({
          title: "Imágenes subidas",
          description: `${uploadedUrls.length} imagen(es) subida(s) correctamente`,
        })
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const uploadToCloudflare = async (file: File): Promise<string | null> => {
    const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL

    if (!workerUrl) {
      throw new Error("CLOUDFLARE_WORKER_URL no configurado")
    }

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${workerUrl}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error al subir imagen")
    }

    const data = await response.json()
    return data.url || null
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Imágenes del Producto ({images.length}/{maxImages})</Label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('multi-image-input')?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Agregar Imágenes
              </>
            )}
          </Button>
        )}
      </div>

      <input
        id="multi-image-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square group">
            <Image
              src={url}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                Principal
              </div>
            )}
          </div>
        ))}

        {/* Placeholder si no hay imágenes */}
        {images.length === 0 && (
          <div
            className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById('multi-image-input')?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center px-2">
              Click para subir imágenes
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        La primera imagen será la principal. Máximo {maxImages} imágenes de 5MB cada una.
      </p>
    </div>
  )
}
