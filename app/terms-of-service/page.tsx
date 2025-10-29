import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos del Servicio - Barcoda Bazar",
  description: "Lee nuestros términos y condiciones de servicio",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Términos del Servicio</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
          <p className="text-muted-foreground">
            Al acceder y utilizar Barcoda Bazar, aceptas cumplir con estos términos de servicio. 
            Si no estás de acuerdo con alguna parte de estos términos, no deberías usar nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
          <p className="text-muted-foreground">
            Barcoda Bazar es una tienda en línea especializada en la venta de figuras de acción coleccionables. 
            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Cuentas de Usuario</h2>
          <p className="text-muted-foreground mb-4">
            Para realizar compras, es necesario crear una cuenta. Te comprometes a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Proporcionar información precisa y actualizada</li>
            <li>Mantener la seguridad de tu contraseña</li>
            <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
            <li>Ser responsable de todas las actividades que ocurran bajo tu cuenta</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Productos y Precios</h2>
          <p className="text-muted-foreground mb-4">
            Nos esforzamos por ofrecer información precisa sobre nuestros productos. Sin embargo:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Las imágenes son representativas y pueden variar ligeramente del producto real</li>
            <li>Los precios están sujetos a cambios sin previo aviso</li>
            <li>Nos reservamos el derecho de limitar cantidades por pedido</li>
            <li>Los productos están sujetos a disponibilidad</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Pedidos y Pago</h2>
          <p className="text-muted-foreground mb-4">
            Al realizar un pedido:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Confirmas que toda la información proporcionada es correcta</li>
            <li>Autorizas el cargo a tu método de pago</li>
            <li>Aceptas los precios y costos de envío indicados</li>
            <li>Entiendes que el pedido puede ser cancelado si detectamos actividad fraudulenta</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Envíos y Entregas</h2>
          <p className="text-muted-foreground mb-4">
            Nos esforzamos por entregar los productos en tiempo y forma:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Los tiempos de entrega son estimados y no garantizados</li>
            <li>No somos responsables por retrasos causados por la empresa de mensajería</li>
            <li>Es tu responsabilidad proporcionar una dirección de envío correcta</li>
            <li>Los costos de envío se calculan según la ubicación y peso del paquete</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Devoluciones y Reembolsos</h2>
          <p className="text-muted-foreground mb-4">
            Política de devoluciones:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Aceptamos devoluciones dentro de los 7 días posteriores a la recepción</li>
            <li>Los productos deben estar en su empaque original y sin abrir</li>
            <li>Los costos de envío de devolución corren por cuenta del cliente</li>
            <li>Los reembolsos se procesarán dentro de 5-10 días hábiles</li>
            <li>Productos con defectos de fábrica serán reemplazados sin costo adicional</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Propiedad Intelectual</h2>
          <p className="text-muted-foreground">
            Todo el contenido de este sitio, incluyendo pero no limitado a textos, imágenes, logos y diseños, 
            es propiedad de Barcoda Bazar o sus licenciantes y está protegido por las leyes de propiedad intelectual.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Limitación de Responsabilidad</h2>
          <p className="text-muted-foreground">
            Barcoda Bazar no será responsable por daños indirectos, incidentales o consecuentes que resulten 
            del uso o la imposibilidad de usar nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Conducta del Usuario</h2>
          <p className="text-muted-foreground mb-4">
            Al usar nuestros servicios, te comprometes a no:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Violar ninguna ley o regulación aplicable</li>
            <li>Transmitir contenido ofensivo o inapropiado</li>
            <li>Intentar acceder sin autorización a sistemas o cuentas</li>
            <li>Interferir con el funcionamiento del sitio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Modificaciones</h2>
          <p className="text-muted-foreground">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
            entrarán en vigor inmediatamente después de su publicación en el sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Ley Aplicable</h2>
          <p className="text-muted-foreground">
            Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los 
            tribunales competentes de México.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contacto</h2>
          <p className="text-muted-foreground">
            Para cualquier pregunta sobre estos términos de servicio, contáctanos a través de nuestras 
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
