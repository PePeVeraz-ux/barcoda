"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

interface Feature {
  name: string
  value: string
}

interface FeaturesEditorProps {
  features: Feature[]
  onFeaturesChange: (features: Feature[]) => void
}

export function FeaturesEditor({ features, onFeaturesChange }: FeaturesEditorProps) {
  const [newFeatureName, setNewFeatureName] = useState("")
  const [newFeatureValue, setNewFeatureValue] = useState("")

  const handleAddFeature = () => {
    if (!newFeatureName.trim() || !newFeatureValue.trim()) return

    onFeaturesChange([
      ...features,
      { name: newFeatureName.trim(), value: newFeatureValue.trim() }
    ])

    setNewFeatureName("")
    setNewFeatureValue("")
  }

  const handleRemoveFeature = (index: number) => {
    onFeaturesChange(features.filter((_, i) => i !== index))
  }

  const handleUpdateFeature = (index: number, field: 'name' | 'value', value: string) => {
    const updated = features.map((feature, i) => 
      i === index ? { ...feature, [field]: value } : feature
    )
    onFeaturesChange(updated)
  }

  return (
    <div className="space-y-4">
      <Label>Características del Producto</Label>

      {/* Lista de características existentes */}
      <div className="space-y-2">
        {features.map((feature, index) => (
          <Card key={index} className="p-3">
            <div className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nombre (ej: Altura)"
                  value={feature.name}
                  onChange={(e) => handleUpdateFeature(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Valor (ej: 30cm)"
                  value={feature.value}
                  onChange={(e) => handleUpdateFeature(index, 'value', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFeature(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Agregar nueva característica */}
      <Card className="p-3 bg-muted/50">
        <div className="flex gap-2 items-end">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input
                placeholder="ej: Material"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
            </div>
            <div>
              <Label className="text-xs">Valor</Label>
              <Input
                placeholder="ej: PVC"
                value={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddFeature}
            disabled={!newFeatureName.trim() || !newFeatureValue.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </Card>

      {features.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay características agregadas. Agrega características como altura, material, accesorios, etc.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Ejemplos: Altura: 30cm, Material: PVC, Articulaciones: 20 puntos, Accesorios: 3 manos intercambiables
      </p>
    </div>
  )
}
