// Worker de Cloudflare para subir imágenes a R2
// Versión corregida con mejor manejo de errores

export default {
  async fetch(request, env) {
    // Configurar CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    // Manejar preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    const url = new URL(request.url);

    // Endpoint para subir imágenes
    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        // Verificar que el bucket esté disponible
        if (!env.BARCODA_BUCKET) {
          return new Response(
            JSON.stringify({ 
              error: 'Bucket R2 no configurado',
              details: 'Verifica que el binding BARCODA_BUCKET esté configurado en el Worker'
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
          return new Response(
            JSON.stringify({ 
              error: 'No se proporcionó ningún archivo',
              details: 'El campo "file" es requerido'
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Validar que sea una imagen
        if (!file.type || !file.type.startsWith('image/')) {
          return new Response(
            JSON.stringify({ 
              error: 'El archivo debe ser una imagen',
              details: `Tipo recibido: ${file.type || 'desconocido'}`
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          return new Response(
            JSON.stringify({ 
              error: 'Archivo demasiado grande',
              details: 'El tamaño máximo es 10MB'
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `products/${timestamp}-${randomString}.${extension}`;

        // Convertir el archivo a ArrayBuffer para R2
        const arrayBuffer = await file.arrayBuffer();

        // Subir a R2
        await env.BARCODA_BUCKET.put(fileName, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });

        // Construir URL pública
        const publicUrl = `https://pub-d835c2702565448daea88c1e8430cf86.r2.dev/${fileName}`;

        return new Response(
          JSON.stringify({ 
            success: true,
            url: publicUrl,
            fileName: fileName,
            size: file.size,
            type: file.type
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
            message: error.message,
            stack: error.stack
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Endpoint de health check
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          bucket: env.BARCODA_BUCKET ? 'configured' : 'not configured',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Not Found',
        availableEndpoints: ['/upload (POST)', '/health (GET)']
      }), 
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  },
};
