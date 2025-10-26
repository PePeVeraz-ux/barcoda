"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    setStatus(newStatus)

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)

      if (error) throw error

      toast({
        title: "Estado actualizado",
        description: `El estado de la orden se cambió a ${getStatusLabel(newStatus)}`,
      })

      // No usar router.refresh() para evitar que el navbar pierda estado
      // El estado se actualiza localmente y en la DB
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      setStatus(currentStatus) // Revertir
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pendiente</SelectItem>
        <SelectItem value="processing">Procesando</SelectItem>
        <SelectItem value="shipped">Enviado</SelectItem>
        <SelectItem value="delivered">Entregado</SelectItem>
        <SelectItem value="cancelled">Cancelado</SelectItem>
      </SelectContent>
    </Select>
  )
}
