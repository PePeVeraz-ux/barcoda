"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface ProductsFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>
}

export function ProductsFilters({ categories }: ProductsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "newest")
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true")
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const applyFilters = () => {
    updateURL({
      category: selectedCategory,
      sort: selectedSort,
      inStock: inStockOnly ? "true" : null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 10000 ? priceRange[1].toString() : null,
    })
    setMobileOpen(false)
  }

  const clearFilters = () => {
    setPriceRange([0, 10000])
    setSelectedCategory("all")
    setSelectedSort("newest")
    setInStockOnly(false)
    router.push(pathname)
    setMobileOpen(false)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Ordenar por</Label>
        <Select value={selectedSort} onValueChange={setSelectedSort}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Categoría</Label>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="font-normal cursor-pointer">
              Todas las categorías
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.slug} id={`cat-${category.slug}`} />
              <Label htmlFor={`cat-${category.slug}`} className="font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Rango de Precio</Label>
        <div className="pt-2">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="flex items-center justify-between">
        <Label htmlFor="inStock" className="text-base font-semibold cursor-pointer">
          Solo en stock
        </Label>
        <Switch id="inStock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button onClick={applyFilters} className="flex-1">
          Aplicar Filtros
        </Button>
        <Button onClick={clearFilters} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros y Ordenamiento
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
