"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_subtotal: number | null
  max_subtotal: number | null
  active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
}

interface CouponsManagerProps {
  initialCoupons: Coupon[]
}

type DiscountType = "percentage" | "fixed"

type FormState = {
  id?: string
  code: string
  description: string
  discountType: DiscountType
  discountValue: string
  minSubtotal: string
  maxSubtotal: string
  active: boolean
  validFrom: string
  validTo: string
}

const emptyFormState: FormState = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "10",
  minSubtotal: "0",
  maxSubtotal: "",
  active: true,
  validFrom: "",
  validTo: "",
}

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "-"
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercentage(value: number) {
  return `${value}%`
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function toDateTimeLocalInput(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function parseDateTimeLocal(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function CouponsManager({ initialCoupons }: CouponsManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>(emptyFormState)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const hasCoupons = useMemo(() => coupons.length > 0, [coupons])

  const handleOpenCreate = () => {
    setFormState(emptyFormState)
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleOpenEdit = (coupon: Coupon) => {
    setFormState({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value.toString(),
      minSubtotal: (coupon.min_subtotal ?? 0).toString(),
      maxSubtotal: coupon.max_subtotal !== null ? coupon.max_subtotal.toString() : "",
      active: coupon.active,
      validFrom: toDateTimeLocalInput(coupon.valid_from),
      validTo: toDateTimeLocalInput(coupon.valid_to),
    })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    if (isSubmitting) return
    setDialogOpen(false)
  }

  const buildPayload = () => {
    const discountValue = Number(formState.discountValue)
    const minSubtotal = Number(formState.minSubtotal || 0)
    const maxSubtotal = formState.maxSubtotal.trim() === "" ? null : Number(formState.maxSubtotal)

    return {
      code: formState.code.trim().toUpperCase(),
      description: formState.description.trim() || null,
      discountType: formState.discountType,
      discountValue,
      minSubtotal,
      maxSubtotal,
      active: formState.active,
      validFrom: parseDateTimeLocal(formState.validFrom),
      validTo: parseDateTimeLocal(formState.validTo),
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = buildPayload()

      const url = isEditing ? `/api/coupons/${formState.id}` : "/api/coupons"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "No se pudo guardar el cupón",
          variant: "destructive",
        })
        return
      }

      const updatedCoupon: Coupon = data.coupon

      setCoupons((prev) => {
        if (isEditing) {
          return prev.map((coupon) => (coupon.id === updatedCoupon.id ? updatedCoupon : coupon))
        }
        return [updatedCoupon, ...prev]
      })

      toast({
        title: isEditing ? "Cupón actualizado" : "Cupón creado",
        description: isEditing ? "Los cambios se guardaron correctamente" : "El cupón se creó correctamente",
      })

      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    setActionId(coupon.id)
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "No se pudo actualizar el estado",
          variant: "destructive",
        })
        return
      }

      const updatedCoupon: Coupon = data.coupon

      setCoupons((prev) => prev.map((item) => (item.id === coupon.id ? updatedCoupon : item)))

      toast({
        title: "Estado actualizado",
        description: updatedCoupon.active ? "El cupón está activo" : "El cupón fue desactivado",
      })
    } catch (error) {
      console.error("Error toggling coupon:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    const confirmDelete = window.confirm(`¿Eliminar el cupón ${coupon.code}? Esta acción no se puede deshacer.`)
    if (!confirmDelete) {
      return
    }

    setActionId(coupon.id)
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "No se pudo eliminar",
          description: data.message || "Revisa que el cupón no esté en uso",
          variant: "destructive",
        })
        return
      }

      setCoupons((prev) => prev.filter((item) => item.id !== coupon.id))

      toast({
        title: "Cupón eliminado",
        description: "El cupón fue eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cupón",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const discountDescription = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return formatPercentage(coupon.discount_value)
    }
    return formatCurrency(coupon.discount_value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cupones</h2>
          <p className="text-muted-foreground">Gestiona los códigos de descuento disponibles en la tienda.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cupón
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-semibold">{coupon.code}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{discountDescription(coupon)}</span>
                    {coupon.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{coupon.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>Mín: {formatCurrency(coupon.min_subtotal ?? 0)}</span>
                    <span>Máx: {coupon.max_subtotal !== null ? formatCurrency(coupon.max_subtotal) : "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>Desde: {formatDate(coupon.valid_from)}</span>
                    <span>Hasta: {formatDate(coupon.valid_to)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() => handleToggleActive(coupon)}
                      disabled={actionId === coupon.id}
                    />
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenEdit(coupon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(coupon)}
                    disabled={actionId === coupon.id}
                  >
                    {actionId === coupon.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {!hasCoupons && <TableCaption>No hay cupones creados todavía.</TableCaption>}
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleCloseDialog())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Cupón" : "Nuevo Cupón"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formState.code}
                onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="EJ: BUENFIN10"
                autoCapitalize="characters"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe las condiciones del cupón"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de descuento</Label>
                <Select
                  value={formState.discountType}
                  onValueChange={(value: DiscountType) => setFormState((prev) => ({ ...prev, discountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountValue">
                  Valor del descuento {formState.discountType === "percentage" ? "(%)" : "($ MXN)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.discountValue}
                  onChange={(event) => setFormState((prev) => ({ ...prev, discountValue: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="minSubtotal">Subtotal mínimo ($ MXN)</Label>
                <Input
                  id="minSubtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.minSubtotal}
                  onChange={(event) => setFormState((prev) => ({ ...prev, minSubtotal: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSubtotal">Subtotal máximo ($ MXN)</Label>
                <Input
                  id="maxSubtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ilimitado"
                  value={formState.maxSubtotal}
                  onChange={(event) => setFormState((prev) => ({ ...prev, maxSubtotal: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">Válido desde</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formState.validFrom}
                  onChange={(event) => setFormState((prev) => ({ ...prev, validFrom: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validTo">Válido hasta</Label>
                <Input
                  id="validTo"
                  type="datetime-local"
                  value={formState.validTo}
                  onChange={(event) => setFormState((prev) => ({ ...prev, validTo: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="mb-1 block">Estado</Label>
                <p className="text-sm text-muted-foreground">Define si el cupón está disponible para los clientes.</p>
              </div>
              <Switch
                checked={formState.active}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
