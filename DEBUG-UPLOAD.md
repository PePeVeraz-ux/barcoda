# 🐛 Debug: Subida de Imágenes

## 📋 Checklist de Verificación

### 1. Variable de Entorno
```bash
# Verifica que esté en tu .env.local
NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://barcoda-api.pepeveras845.workers.dev
```

### 2. Reiniciar el Servidor
```bash
# Después de agregar la variable, DEBES reiniciar
Ctrl + C
npm run dev
```

### 3. Verificar en la Consola del Navegador

Cuando intentes subir una imagen, deberías ver en la consola (F12):

```
🔧 Worker URL: https://barcoda-api.pepeveras845.workers.dev
📤 Enviando archivo: { name: "imagen.jpg", size: 123456, type: "image/jpeg" }
📥 Respuesta del Worker: { status: 200, statusText: "OK", ok: true }
✅ Respuesta exitosa del Worker: { success: true, url: "https://pub-xxxxx.r2.dev/products/..." }
📤 Subiendo imagen al bucket...
✅ Imagen subida: https://pub-xxxxx.r2.dev/products/1234567890-abc123.jpg
💾 Guardando producto en Supabase...
📦 Datos del producto: { name: "...", price: 49.99, image_url: "https://...", ... }
➕ Creando nuevo producto...
✅ Producto creado
🔄 Redirigiendo a lista de productos...
```

## 🔍 Posibles Problemas

### Problema 1: "Worker URL: undefined"
**Causa:** Variable de entorno no configurada o servidor no reiniciado

**Solución:**
1. Verifica que `.env.local` tenga la variable
2. Reinicia el servidor (`Ctrl + C` y `npm run dev`)
3. Recarga la página del navegador

### Problema 2: "Error al subir imagen"
**Causa:** Worker no responde correctamente

**Solución:**
1. Verifica que el Worker esté desplegado
2. Prueba el health check: `https://barcoda-api.pepeveras845.workers.dev/health`
3. Revisa los logs del Worker en Cloudflare

### Problema 3: "El Worker no devolvió una URL válida"
**Causa:** El Worker no está retornando `data.url`

**Solución:**
1. Verifica que el Worker tenga el código de `cloudflare-worker-fixed.js`
2. Asegúrate de que la línea 99 tenga tu dominio R2 correcto
3. Prueba con cURL:
   ```bash
   curl -X POST https://barcoda-api.pepeveras845.workers.dev/upload \
     -F "file=@imagen.jpg"
   ```

### Problema 4: Imagen se sube pero no se guarda en Supabase
**Causa:** Error en las políticas RLS o en los datos del producto

**Solución:**
1. Revisa la consola para ver el error específico de Supabase
2. Verifica que todos los campos requeridos estén llenos
3. Comprueba las políticas RLS de la tabla `products`

## 🧪 Prueba Paso a Paso

### 1. Verificar Worker
```bash
# Debe devolver: {"status":"ok","bucket":"configured",...}
curl https://barcoda-api.pepeveras845.workers.dev/health
```

### 2. Verificar Variable de Entorno
```javascript
// En la consola del navegador (F12)
console.log(process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL)
// Debe mostrar: https://barcoda-api.pepeveras845.workers.dev
```

### 3. Subir Imagen de Prueba
1. Ve a `/admin/products/new`
2. Llena todos los campos requeridos:
   - Nombre
   - Precio
   - Stock
   - Categoría
3. Haz clic en "Subir Imagen"
4. Selecciona una imagen pequeña (< 1MB)
5. Abre la consola (F12) y observa los logs
6. Haz clic en "Crear Producto"

### 4. Verificar en R2
1. Ve a tu bucket en Cloudflare
2. Deberías ver la carpeta `products/`
3. Dentro debe estar tu imagen

### 5. Verificar en Supabase
1. Ve a Table Editor > products
2. Busca tu producto recién creado
3. La columna `image_url` debe tener la URL completa

## 📊 Flujo Completo

```
1. Usuario selecciona imagen
   ↓
2. Preview se muestra
   ↓
3. Usuario llena formulario
   ↓
4. Usuario hace clic en "Crear Producto"
   ↓
5. Se valida que hay imagen
   ↓
6. Se sube imagen a Worker
   ↓
7. Worker sube a R2
   ↓
8. Worker devuelve URL pública
   ↓
9. Se guarda producto en Supabase con la URL
   ↓
10. Redirección a /admin/products
```

## 🎯 Siguiente Paso

1. **Reinicia el servidor** si no lo has hecho
2. **Abre la consola del navegador** (F12)
3. **Intenta subir un producto con imagen**
4. **Copia y pega aquí los logs de la consola**

Esto me ayudará a ver exactamente dónde se está deteniendo el proceso.
