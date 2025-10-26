// Ejemplo de Worker de Cloudflare para subir imágenes a R2
// Este archivo es solo de referencia - el Worker debe estar desplegado en Cloudflare

export default {
  async fetch(request, env) {
    // Configurar CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // En producción, especifica tu dominio
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Manejar preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Endpoint para subir imágenes
    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
          return new Response(
            JSON.stringify({ error: 'No se proporcionó ningún archivo' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          return new Response(
            JSON.stringify({ error: 'El archivo debe ser una imagen' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const fileName = `products/${timestamp}-${randomString}.${extension}`;

        // Subir a R2
        await env.BARCODA_BUCKET.put(fileName, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });

        // Construir URL pública
        // Opción 1: Si tienes un dominio personalizado configurado en R2
        //const publicUrl = `https://tu-dominio-r2.com/${fileName}`;
        
        // Opción 2: Si usas el dominio público de R2
        const publicUrl = `https://pub-d835c2702565448daea88c1e8430cf86.r2.dev/${fileName}`;

        return new Response(
          JSON.stringify({ 
            success: true,
            url: publicUrl,
            fileName: fileName
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        console.error('Error al subir archivo:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Error al subir el archivo',
            message: error.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Endpoint para obtener una imagen
    if (url.pathname.startsWith('/images/') && request.method === 'GET') {
      try {
        const fileName = url.pathname.replace('/images/', '');
        const object = await env.BARCODA_BUCKET.get(fileName);

        if (!object) {
          return new Response('Imagen no encontrada', { 
            status: 404,
            headers: corsHeaders
          });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');
        
        // Agregar CORS
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });

        return new Response(object.body, { headers });

      } catch (error) {
        return new Response('Error al obtener la imagen', { 
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders
    });
  },
};

/* 
CONFIGURACIÓN EN CLOUDFLARE:

1. Crear un bucket R2:
   - Ve a R2 en tu dashboard de Cloudflare
   - Crea un bucket llamado "barcoda-images" (o el nombre que prefieras)

2. Configurar el Worker:
   - Ve a Workers & Pages
   - Crea un nuevo Worker
   - Pega este código
   - En Settings > Variables, agrega:
     - BARCODA_BUCKET (R2 Bucket Binding) -> selecciona tu bucket

3. Configurar dominio público (opcional):
   - En R2, ve a tu bucket
   - Settings > Public Access
   - Habilita "Allow Access" y configura un dominio personalizado
   - O usa el dominio público que te proporciona Cloudflare

4. Variables de entorno en Next.js:
   - NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://barcoda-api.pepeveras845.workers.dev

5. CORS (si tienes problemas):
   - Asegúrate de que el Worker tenga los headers CORS correctos
   - En producción, cambia '*' por tu dominio específico
*/
