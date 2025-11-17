/**
 * Utilidades para calcular costos de envío
 */

const SHIPPING_COST_PER_BOX = 160 // $160 MXN por caja
const MAX_WEIGHT_PER_BOX = 1 // 1 kg por caja

interface CartItem {
  quantity: number
  products: {
    weight?: number | null
  }
}

/**
 * Calcula el peso total del carrito
 */
export function calculateTotalWeight(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemWeight = Number(item.products.weight) || 0.25 // Default 250g si no tiene peso
    return total + (itemWeight * item.quantity)
  }, 0)
}

/**
 * Calcula el número de cajas necesarias
 */
export function calculateBoxesNeeded(totalWeight: number): number {
  if (totalWeight === 0) return 0
  return Math.ceil(totalWeight / MAX_WEIGHT_PER_BOX)
}

/**
 * Calcula el costo total de envío
 */
export function calculateShippingCost(totalWeight: number): number {
  const boxes = calculateBoxesNeeded(totalWeight)
  return boxes * SHIPPING_COST_PER_BOX
}

/**
 * Calcula todos los detalles de envío
 */
export function calculateShipping(items: CartItem[]) {
  const totalWeight = calculateTotalWeight(items)
  const boxes = calculateBoxesNeeded(totalWeight)
  const cost = calculateShippingCost(totalWeight)

  return {
    totalWeight,
    boxes,
    cost,
    isFree: cost === 0,
    details: `${boxes} caja(s) - ${totalWeight.toFixed(2)} kg total`
  }
}
