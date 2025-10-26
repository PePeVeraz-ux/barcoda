# 🔧 Troubleshooting: Error 401 en Cloudflare Worker

## ❌ Error Actual

```
POST https://barcoda-api.pepeveras845.workers.dev/upload 401 (Unauthorized)
Error al subir imagen: Error al subir imagen
```

## 🔍 Causas Posibles

### 1. **Binding R2 No Configurado** (Más Probable)

El Worker no tiene acceso al bucket R2.

**Solución:**

1. Ve a tu Worker en Cloudflare Dashboard
2. Click en **Settings** > **Variables**
3. Busca la sección **R2 Bucket Bindings**
4. Verifica que exista un binding:
   - **Variable name:** `BARCODA_BUCKET`
   - **R2 bucket:** `barcoda-images` (o tu bucket)
5. Si NO existe, agrégalo:
   - Click en **Add binding**
   - Tipo: **R2 bucket**
   - Variable name: `BARCODA_BUCKET` (exactamente así, mayúsculas)
   - R2 bucket: Selecciona tu bucket
   - Click en **Save**
6. **IMPORTANTE:** Después de agregar el binding, debes **redeploy** el Worker:
   - Ve a **Deployments**
   - Click en **Redeploy** en el deployment más reciente

### 2. **Worker Desactualizado**

El código del Worker puede estar desactualizado.

**Solución:**

1. Ve a tu Worker en Cloudflare
2. Click en **Edit code**
3. Reemplaza TODO el código con el de `cloudflare-worker-fixed.js`
4. Click en **Save and Deploy**

### 3. **Dominio R2 Incorrecto**

El dominio público del bucket puede estar mal configurado.

**Solución:**

1. Ve a tu bucket R2 en Cloudflare
2. Ve a **Settings** > **Public Access**
3. Verifica que esté **habilitado**
4. Copia el dominio público (ej: `https://pub-xxxxx.r2.dev`)
5. Actualiza la línea 99 del Worker con ese dominio

### 4. **CORS Headers**

Puede haber un problema con los headers CORS.

**Solución:**

El nuevo código (`cloudflare-worker-fixed.js`) ya tiene CORS mejorado:
```javascript
'Access-Control-Allow-Headers': '*',
```

## ✅ Pasos de Verificación

### Paso 1: Verificar Binding

```bash
# En Cloudflare Dashboard:
# Workers > tu-worker > Settings > Variables
# Debe aparecer:
# R2 Bucket Bindings
#   BARCODA_BUCKET → barcoda-images
```

### Paso 2: Probar Health Check

Abre en tu navegador:
```
https://barcoda-api.pepeveras845.workers.dev/health
```

Deberías ver:
```json
{
  "status": "ok",
  "bucket": "configured",
  "timestamp": "2025-10-26T07:00:00.000Z"
}
```

Si ves `"bucket": "not configured"`, el binding NO está configurado.

### Paso 3: Probar Upload con cURL

```bash
curl -X POST https://barcoda-api.pepeveras845.workers.dev/upload \
  -F "file=@/ruta/a/imagen.jpg" \
  -v
```

Deberías ver:
```json
{
  "success": true,
  "url": "https://pub-xxxxx.r2.dev/products/1234567890-abc123.jpg",
  "fileName": "products/1234567890-abc123.jpg"
}
```

### Paso 4: Ver Logs del Worker

1. Ve a tu Worker en Cloudflare
2. Click en **Logs** (o **Real-time Logs**)
3. Intenta subir una imagen desde tu app
4. Observa los logs para ver el error exacto

## 🚀 Solución Rápida

**Sigue estos pasos en orden:**

1. **Actualizar código del Worker:**
   - Copia `cloudflare-worker-fixed.js`
   - Pega en tu Worker
   - Save and Deploy

2. **Verificar/Agregar Binding:**
   - Settings > Variables
   - R2 Bucket Bindings
   - Agregar: `BARCODA_BUCKET` → tu bucket
   - Save

3. **Redeploy:**
   - Deployments > Redeploy

4. **Probar Health Check:**
   - `https://tu-worker.workers.dev/health`
   - Debe decir `"bucket": "configured"`

5. **Probar en la App:**
   - Ve a `/admin/products/new`
   - Sube una imagen

## 📝 Código Actualizado del Worker

Usa el archivo `cloudflare-worker-fixed.js` que tiene:

- ✅ Mejor manejo de errores
- ✅ Validación del binding
- ✅ CORS mejorado
- ✅ Health check endpoint
- ✅ Logs detallados
- ✅ Conversión a ArrayBuffer (más compatible)

## 🔒 Permisos del Worker

El Worker necesita:
- ✅ Acceso al bucket R2 (via binding)
- ✅ Sin autenticación adicional (el binding maneja esto)

## 💡 Tip: Debugging

Si sigues teniendo problemas, agrega esto temporalmente al Worker:

```javascript
console.log('Bucket disponible:', !!env.BARCODA_BUCKET);
console.log('File recibido:', file ? file.name : 'ninguno');
```

Luego revisa los logs en Cloudflare Dashboard.

## ❓ Preguntas Frecuentes

**Q: ¿Por qué 401 y no 500?**
A: Cloudflare devuelve 401 cuando el Worker no tiene permisos para acceder a R2.

**Q: ¿Necesito configurar algo en R2?**
A: Solo habilitar el acceso público en Settings > Public Access.

**Q: ¿El binding es sensible a mayúsculas?**
A: Sí, debe ser exactamente `BARCODA_BUCKET`.

**Q: ¿Cuánto tarda en aplicarse el binding?**
A: Inmediato después del redeploy.

## 📞 Siguiente Paso

Después de aplicar estos cambios, intenta subir una imagen de nuevo y dime qué error ves (si hay alguno).
