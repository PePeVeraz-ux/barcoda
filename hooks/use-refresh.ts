"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * Hook personalizado para refrescar datos sin causar re-render completo del navbar
 * Usa revalidación de rutas en lugar de router.refresh()
 */
export function useRefresh() {
  const router = useRouter()

  const refresh = useCallback(() => {
    // En lugar de router.refresh() que causa re-render completo,
    // solo actualizamos la ruta actual
    router.replace(window.location.pathname + window.location.search, {
      scroll: false,
    })
  }, [router])

  return refresh
}
