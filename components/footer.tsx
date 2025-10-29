import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la tienda */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Barcoda Bazar</h3>
            <p className="text-sm text-muted-foreground">
              La mejor tienda de figuras de acción coleccionables. 
              Encuentra tus personajes favoritos de Marvel, DC, Star Wars y más.
            </p>
          </div>

          {/* Enlaces legales */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Información Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos del Servicio
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/VENTASBARCODA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
                <span className="text-sm">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/barcodabazar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Barcoda Bazar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
