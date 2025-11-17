'use client'

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Fuerza un recargado completo y limpia el Cache Storage cada vez que se navega a una nueva ruta.
 */
export function CacheBuster() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasMountedRef = useRef(false)

  const search = searchParams?.toString() ?? ""

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    const clearCachesAndReload = async () => {
      if (typeof window === "undefined") {
        return
      }

      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map((name) => caches.delete(name)))
        } catch (error) {
          console.warn("No se pudo limpiar el cache del navegador", error)
        }
      }

      window.location.reload()
    }

    void clearCachesAndReload()
  }, [pathname, search])

  return null
}
