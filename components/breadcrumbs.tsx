"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Si no se proporcionan items, generarlos automáticamente desde el pathname
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast || !item.href ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Saltar UUIDs y segmentos que parecen IDs
    if (
      segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
      segment.match(/^[0-9]+$/)
    ) {
      continue
    }

    // Mapear nombres de rutas comunes
    const labelMap: Record<string, string> = {
      products: "Productos",
      cart: "Carrito",
      checkout: "Finalizar Compra",
      orders: "Mis Órdenes",
      admin: "Administración",
      auth: "Autenticación",
      login: "Iniciar Sesión",
      "sign-up": "Registro",
      search: "Búsqueda",
    }

    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: i === segments.length - 1 ? undefined : currentPath,
    })
  }

  return breadcrumbs
}
