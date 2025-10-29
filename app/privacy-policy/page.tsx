import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Políticas de Privacidad - Barcoda Bazar",
  description: "Conoce nuestras políticas de privacidad y cómo protegemos tus datos personales",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Políticas de Privacidad</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
          <p className="text-muted-foreground mb-4">
            En Barcoda Bazar, recopilamos la siguiente información cuando utilizas nuestros servicios:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Información de cuenta: nombre, correo electrónico</li>
            <li>Información de pedidos: dirección de envío, historial de compras</li>
            <li>Información de pago: procesada de forma segura a través de servicios de terceros</li>
            <li>Información de navegación: cookies y datos de uso del sitio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
          <p className="text-muted-foreground mb-4">
            Utilizamos tu información para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Procesar y gestionar tus pedidos</li>
            <li>Comunicarnos contigo sobre tus compras</li>
            <li>Mejorar nuestros productos y servicios</li>
            <li>Enviar actualizaciones y promociones (con tu consentimiento)</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
          <p className="text-muted-foreground">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales 
            contra acceso no autorizado, pérdida o destrucción. Utilizamos encriptación SSL para todas las 
            transacciones y almacenamos los datos en servidores seguros.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
          <p className="text-muted-foreground mb-4">
            No vendemos tu información personal. Solo compartimos datos con:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Proveedores de servicios de pago</li>
            <li>Empresas de mensajería para entregas</li>
            <li>Autoridades cuando sea requerido por ley</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
          <p className="text-muted-foreground">
            Utilizamos cookies para mejorar tu experiencia de navegación. Puedes configurar tu navegador 
            para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Tus Derechos</h2>
          <p className="text-muted-foreground mb-4">
            Tienes derecho a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Acceder a tus datos personales</li>
            <li>Solicitar la corrección de datos inexactos</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Oponerte al procesamiento de tus datos</li>
            <li>Retirar tu consentimiento en cualquier momento</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Menores de Edad</h2>
          <p className="text-muted-foreground">
            Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente 
            información de menores sin el consentimiento de los padres o tutores.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Cambios a esta Política</h2>
          <p className="text-muted-foreground">
            Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios 
            significativos publicando la nueva política en esta página con una fecha de actualización.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
          <p className="text-muted-foreground">
            Si tienes preguntas sobre esta política de privacidad, contáctanos a través de nuestras 
            redes sociales en Facebook o Instagram.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
