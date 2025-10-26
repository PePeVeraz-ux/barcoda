# 📦 Configuración de Cloudflare R2 para Barcoda

Esta guía te ayudará a configurar Cloudflare R2 y Workers para el almacenamiento de imágenes de productos.

## 🎯 Resumen

- **R2**: Almacenamiento de objetos compatible con S3
- **Worker**: API para subir imágenes desde Next.js
- **Costo**: Muy económico (10GB gratis/mes)

## 📋 Requisitos

- Cuenta de Cloudflare (gratuita)
- Tarjeta de crédito (para activar R2, pero el tier gratuito es generoso)

## 🚀 Paso a Paso

### 1. Crear Bucket R2

1. **Accede a Cloudflare Dashboard**
   - Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
   - Inicia sesión

2. **Navega a R2**
   - En el menú lateral, busca **R2 Object Storage**
   - Si es tu primera vez, acepta los términos

3. **Crear Bucket**
   - Haz clic en **Create bucket**
   - Nombre: `barcoda-images` (o el que prefieras)
   - Location: Automático (o elige la más cercana)
   - Haz clic en **Create bucket**

4. **Configurar Acceso Público** (Opcional pero recomendado)
   - Ve a tu bucket
   - Settings > Public Access
   - Habilita **Allow Access**
   - Copia el dominio público: `https://pub-xxxxxxxx.r2.dev`
   - Guarda este dominio, lo usarás en el Worker

### 2. Crear Worker

1. **Ir a Workers & Pages**
   - En el menú lateral, selecciona **Workers & Pages**
   - Haz clic en **Create application**
   - Selecciona **Create Worker**

2. **Configurar Worker**
   - Nombre: `barcoda-api` (o el que prefieras)
   - Haz clic en **Deploy**

3. **Editar Código**
   - Haz clic en **Edit code**
   - Borra todo el código existente
   - Copia y pega el código de `cloudflare-worker-example.js`
   - **IMPORTANTE**: Actualiza la línea del `publicUrl` con tu dominio R2:
     ```javascript
     const publicUrl = `https://pub-xxxxxxxx.r2.dev/${fileName}`;
     ```
   - Haz clic en **Save and Deploy**

### 3. Conectar Worker con R2

1. **Ir a Settings del Worker**
   - En tu Worker, ve a **Settings**
   - Busca la sección **Variables**

2. **Agregar R2 Bucket Binding**
   - Haz clic en **Add binding**
   - Tipo: **R2 bucket**
   - Variable name: `BARCODA_BUCKET` (debe ser exactamente este nombre)
   - R2 bucket: Selecciona `barcoda-images`
   - Haz clic en **Save**

3. **Redeploy el Worker**
   - Ve a **Deployments**
   - Haz clic en **Redeploy** en el deployment más reciente

### 4. Obtener URL del Worker

1. **Copiar URL**
   - Ve a **Triggers** en tu Worker
   - Copia la URL: `https://barcoda-api.pepeveras845.workers.dev`
   - Esta es tu `NEXT_PUBLIC_CLOUDFLARE_WORKER_URL`

2. **Agregar a .env.local**
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://barcoda-api.pepeveras845.workers.dev
   ```

### 5. Probar la Configuración

1. **Probar Upload**
   ```bash
   curl -X POST https://barcoda-api.pepeveras845.workers.dev/upload \
     -F "file=@/ruta/a/tu/imagen.jpg"
   ```

   Deberías recibir:
   ```json
   {
     "success": true,
     "url": "https://pub-xxxxxxxx.r2.dev/products/1234567890-abc123.jpg",
     "fileName": "products/1234567890-abc123.jpg"
   }
   ```

2. **Probar en la App**
   - Inicia tu app: `npm run dev`
   - Ve a `/admin/products/new`
   - Haz clic en "Subir Imagen"
   - Selecciona una imagen
   - Verifica que se suba correctamente

## 🔧 Código del Worker

El Worker debe tener este código (ya está en `cloudflare-worker-example.js`):

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !file.type.startsWith('image/')) {
          return new Response(
            JSON.stringify({ error: 'Archivo inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          );
        }

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const fileName = `products/${timestamp}-${randomString}.${extension}`;

        await env.BARCODA_BUCKET.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        // ⚠️ ACTUALIZA ESTA URL CON TU DOMINIO R2
        const publicUrl = `https://pub-xxxxxxxx.r2.dev/${fileName}`;

        return new Response(
          JSON.stringify({ success: true, url: publicUrl, fileName }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
```

## ⚠️ Importante

1. **Dominio Público**: Asegúrate de actualizar el `publicUrl` con tu dominio R2 real
2. **CORS**: El Worker ya tiene CORS configurado para `*`. En producción, cámbialo a tu dominio
3. **Binding Name**: El nombre `BARCODA_BUCKET` debe coincidir exactamente en el Worker y en Settings
4. **Límites**: R2 Free tier incluye:
   - 10 GB de almacenamiento
   - 1 millón de operaciones Clase A/mes
   - 10 millones de operaciones Clase B/mes

## 🐛 Troubleshooting

### Error: "BARCODA_BUCKET is not defined"
- Verifica que el binding esté configurado correctamente
- El nombre debe ser exactamente `BARCODA_BUCKET`
- Redeploy el Worker después de agregar el binding

### Error: "CORS policy"
- Verifica que los headers CORS estén en el Worker
- Asegúrate de manejar OPTIONS requests

### Imagen no se muestra
- Verifica que el dominio público esté habilitado en R2
- Comprueba que la URL retornada sea correcta
- Intenta acceder directamente a la URL de la imagen

### Error 500 al subir
- Revisa los logs del Worker en Cloudflare Dashboard
- Verifica que el archivo sea una imagen válida
- Comprueba que no exceda 5MB

## 📊 Monitoreo

1. **Ver Logs del Worker**
   - Ve a tu Worker > Logs
   - Aquí verás todas las requests y errores

2. **Estadísticas de R2**
   - Ve a tu bucket > Metrics
   - Verás uso de almacenamiento y operaciones

## 💰 Costos

- **Free Tier**: 10GB almacenamiento + 1M operaciones/mes
- **Después**: ~$0.015/GB/mes (muy económico)
- **Workers**: Incluido en el plan gratuito (100k requests/día)

## ✅ Checklist Final

- [ ] Bucket R2 creado
- [ ] Acceso público habilitado
- [ ] Worker creado y desplegado
- [ ] Binding R2 configurado
- [ ] URL del Worker copiada
- [ ] Variable de entorno agregada
- [ ] Código del Worker actualizado con dominio R2
- [ ] Probado upload desde la app

¡Listo! Ahora puedes subir imágenes de productos directamente a Cloudflare R2. 🎉
