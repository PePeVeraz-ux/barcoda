# Solución: Google OAuth Muestra Dominio de Supabase

## 🔴 Problema Identificado

En tus imágenes veo que en **Supabase > Authentication > URL Configuration**:
- **Site URL**: `localhost:3000` ❌

**Esto es el problema.** El Site URL de Supabase es lo que determina qué dominio muestra Google en el mensaje de OAuth.

## ✅ Solución

### Paso 1: Cambiar Site URL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/xtxvfwhaloimarwwhezj
2. Ve a **Authentication** > **URL Configuration**
3. En **Site URL**, cambia de:
   ```
   localhost:3000
   ```
   A:
   ```
   https://barcodabazar.vercel.app
   ```
4. Haz clic en **"Save changes"**

### Paso 2: Verificar Variable en Vercel

Asegúrate de que en Vercel tienes configurado:

1. Ve a: https://vercel.com/tu-usuario/barcodabazar/settings/environment-variables
2. Verifica que existe:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://barcodabazar.vercel.app`
3. Si no existe, agrégala
4. Si la agregaste recién, haz un **re-deploy**

## 🎯 Resultado Esperado

### Antes (Actual)
Al hacer login con Google, el mensaje dice:
> "Google permitirá que xtxvfwhaloimarwwhezj.supabase.co acceda a esta información sobre ti"

### Después (Correcto)
Al hacer login con Google, el mensaje dirá:
> "Google permitirá que barcodabazar.vercel.app acceda a esta información sobre ti"

## 📝 Explicación Técnica

### ¿Por qué pasa esto?

Cuando Supabase maneja el OAuth de Google, usa el **Site URL** configurado en su panel como el dominio principal de tu aplicación. Este valor se envía a Google durante el flujo de OAuth.

### Flujo de OAuth

1. Usuario hace clic en "Continúa con Google"
2. Tu código envía el request a Supabase con `redirectTo`
3. Supabase inicia el OAuth con Google usando el **Site URL** como identificador principal
4. Google muestra el mensaje de autorización con ese dominio
5. Después de aprobar, Google redirige a Supabase
6. Supabase redirige a tu `redirectTo` URL

### ¿Qué hace NEXT_PUBLIC_SITE_URL?

La variable `NEXT_PUBLIC_SITE_URL` que agregamos en el código controla el **paso 2** (la URL de redirección), pero NO controla lo que Google muestra en el mensaje. Eso lo controla el **Site URL de Supabase**.

## 🧪 Cómo Probar

1. **Cambia el Site URL en Supabase** a `https://barcodabazar.vercel.app`
2. **Espera 1-2 minutos** (los cambios pueden tardar un poco)
3. **Limpia la caché del navegador** o usa ventana incógnita
4. Ve a: https://barcodabazar.vercel.app/auth/login
5. Haz clic en "Continúa con Google"
6. El mensaje de Google ahora debe mostrar tu dominio

## ⚠️ Notas Importantes

### Para Desarrollo Local

Si quieres probar en desarrollo local, tendrías que:
1. Cambiar el Site URL de Supabase a `http://localhost:3000`
2. Probar localmente
3. Cambiar de nuevo a `https://barcodabazar.vercel.app` para producción

**Recomendación:** Mantén el Site URL en tu dominio de producción y acepta que en desarrollo local mostrará el dominio de producción en el mensaje de Google. Esto no afecta la funcionalidad.

### ¿Múltiples Dominios?

Si necesitas diferentes Site URLs para desarrollo y producción, considera:
- Crear un proyecto de Supabase separado para desarrollo
- O usar diferentes credenciales OAuth de Google para cada ambiente

## 🎯 Configuración Final Correcta

### En Supabase:
- **Site URL**: `https://barcodabazar.vercel.app` ✅
- **Redirect URLs**: 
  - `https://barcodabazar.vercel.app/auth/callback` ✅
  - `https://barcodabazar.vercel.app/**` ✅
  - `http://localhost:3000/auth/callback` (opcional, para desarrollo)

### En Google Cloud Console:
- **Orígenes autorizados JS**: `https://barcodabazar.vercel.app` ✅
- **URIs de redirección**: `https://barcodabazar.vercel.app/auth/callback` ✅
- Mantener también el de Supabase: `https://xtxvfwhaloimarwwhezj.supabase.co/auth/v1/callback` ✅

### En Vercel:
- **NEXT_PUBLIC_SITE_URL**: `https://barcodabazar.vercel.app` ✅

## ✅ Checklist Final

- [ ] Site URL en Supabase = `https://barcodabazar.vercel.app`
- [ ] Variable en Vercel configurada
- [ ] Re-deploy de la aplicación (si agregaste la variable)
- [ ] Esperado 1-2 minutos después del cambio
- [ ] Probado en ventana incógnita
- [ ] El mensaje de Google muestra tu dominio

¡Una vez hagas el cambio en Supabase, debería funcionar inmediatamente!
