"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Percent, RefreshCcw, Sparkles } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductItem {
  id: string
  name: string
  price: number
  stock: number
  category_id: string | null
  categories?: {
    name: string | null
  } | null
  sale_active: boolean
  sale_price: number | null
  sale_percentage: number | null
  sale_applied_at: string | null
}

type SaleScope = "all" | "category" | "products"

type ActionState = "apply" | "revert" | null

interface SaleManagerProps {
  categories: Category[]
  products: ProductItem[]
}

export function SaleManager({ categories, products }: SaleManagerProps) {
  const [productList, setProductList] = useState<ProductItem[]>(products)
  const [scope, setScope] = useState<SaleScope>("all")
  const [percentage, setPercentage] = useState("15")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [actionState, setActionState] = useState<ActionState>(null)
  const { toast } = useToast()

  const productsOnSale = useMemo(() => productList.filter((product) => product.sale_active), [productList])

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const resetState = () => {
    setActionState(null)
  }

  const updateProductsLocal = (targetIds: Set<string>, salePercentage: number | null) => {
    setProductList((prev) =>
      prev.map((product) => {
        if (!targetIds.has(product.id)) {
          return product
        }

        if (salePercentage !== null) {
          const salePrice = Number((product.price * (1 - salePercentage / 100)).toFixed(2))
          return {
            ...product,
            sale_active: true,
            sale_price: salePrice,
            sale_percentage: salePercentage,
            sale_applied_at: new Date().toISOString(),
          }
        }

        return {
          ...product,
          sale_active: false,
          sale_price: null,
          sale_percentage: null,
          sale_applied_at: null,
        }
      }),
    )
  }

  const getTargetIds = (validate: boolean): Set<string> | null => {
    switch (scope) {
      case "category": {
        if (!categoryId) {
          if (validate) {
            toast({
              title: "Selecciona una categoría",
              description: "Debes elegir una categoría para aplicar la promoción",
              variant: "destructive",
            })
          }
          return validate ? null : new Set<string>()
        }
        return new Set(productList.filter((product) => product.category_id === categoryId).map((product) => product.id))
      }
      case "products": {
        if (selectedProducts.length === 0) {
          if (validate) {
            toast({
              title: "Selecciona productos",
              description: "Elige uno o más productos para aplicar la promoción",
              variant: "destructive",
            })
          }
          return validate ? null : new Set<string>()
        }
        return new Set(selectedProducts)
      }
      case "all":
      default: {
        return new Set(productList.map((product) => product.id))
      }
    }
  }

  const handleApply = async () => {
    const targets = getTargetIds(true)
    if (!targets) return

    const percentageValue = Number(percentage)
    if (!Number.isFinite(percentageValue) || percentageValue <= 0 || percentageValue >= 100) {
      toast({
        title: "Porcentaje inválido",
        description: "Ingresa un valor mayor a 0 y menor a 100",
        variant: "destructive",
      })
      return
    }

    setActionState("apply")
    try {
      const response = await fetch("/api/sales/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          categoryId,
          productIds: scope === "products" ? selectedProducts : undefined,
          percentage: percentageValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "No se pudo aplicar la promoción",
          description: data.message || "Intenta nuevamente",
          variant: "destructive",
        })
        return
      }

      updateProductsLocal(targets, percentageValue)

      toast({
        title: "Promoción aplicada",
        description: `Se actualizaron ${data.updated || targets.size} producto(s)`,
      })
    } catch (error) {
      console.error("Error applying sale:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      resetState()
    }
  }

  const handleRevert = async () => {
    const targets = getTargetIds(true)
    if (!targets) return

    setActionState("revert")
    try {
      const response = await fetch("/api/sales/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          categoryId,
          productIds: scope === "products" ? selectedProducts : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "No se pudo revertir",
          description: data.message || "Intenta nuevamente",
          variant: "destructive",
        })
        return
      }

      updateProductsLocal(targets, null)

      toast({
        title: "Promoción revertida",
        description: `Se actualizaron ${data.updated || targets.size} producto(s)`,
      })
    } catch (error) {
      console.error("Error reverting sale:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      resetState()
    }
  }

  const targetProductsPreview = useMemo(() => {
    const targets = getTargetIds(false)
    if (!targets) return []
    return productList.filter((product) => targets.has(product.id))
  }, [scope, categoryId, selectedProducts, productList])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Campaña Buen Fin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ámbito</Label>
                <Select value={scope} onValueChange={(value: SaleScope) => setScope(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toda la tienda</SelectItem>
                    <SelectItem value="category">Categoría específica</SelectItem>
                    <SelectItem value="products">Productos seleccionados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === "category" && (
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={categoryId || ""}
                    onValueChange={(value) => setCategoryId(value || null)}
                  >
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
              )}

              {scope === "products" && (
                <div className="space-y-2">
                  <Label>Productos</Label>
                  <div className="max-h-60 overflow-y-auto rounded-lg border p-3 space-y-2">
                    {productList.map((product) => (
                      <label key={product.id} className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <span>
                          <span className="font-medium block">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ${product.price.toFixed(2)} · {product.categories?.name || "Sin categoría"}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Porcentaje de descuento (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    step="0.5"
                    value={percentage}
                    onChange={(event) => setPercentage(event.target.value)}
                    className="pr-10"
                  />
                  <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="grid gap-2 rounded-md border p-4 text-sm bg-muted/40">
                <span className="font-medium">Resumen</span>
                <span>Productos seleccionados: {targetProductsPreview.length}</span>
                <span>Productos con oferta activa: {productsOnSale.length}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleApply} disabled={actionState !== null}>
                  {actionState === "apply" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activar promoción
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleRevert}
                  disabled={actionState !== null}
                >
                  {actionState === "revert" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Revertir promoción
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de productos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio base</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Categoría</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.map((product) => {
                const hasSale = product.sale_active && product.sale_price && product.sale_price < product.price
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        {hasSale && (
                          <span className="text-xs text-muted-foreground">
                            Última actualización: {product.sale_applied_at ? new Date(product.sale_applied_at).toLocaleString("es-MX") : "-"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {hasSale ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">${product.sale_price?.toFixed(2)}</span>
                          <Badge variant="secondary" className="mt-1 w-fit bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                            -{product.sale_percentage?.toFixed(0)}%
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin oferta</span>
                      )}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.categories?.name || "-"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
