# Configuración de OAuth para Producción

## Problema Resuelto
Al iniciar sesión con Google, aparecía el mensaje "Accede a xtxvfwhaloimarwwhezj.supabase.co" en lugar de mostrar tu dominio de producción.

## Solución Implementada

### 1. Variable de Entorno Agregada
Se agregó `NEXT_PUBLIC_SITE_URL` al archivo `.env`:

```env
NEXT_PUBLIC_SITE_URL = "https://barcodabazar.vercel.app"
```

### 2. Código Actualizado
El código de autenticación ahora usa esta variable:

```typescript
const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${redirectUrl}/auth/callback`,
  },
})
```

## Configuración en Vercel

Para que esto funcione en producción, necesitas agregar la variable de entorno en Vercel:

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto (barcodabazar)
3. Ve a **Settings** > **Environment Variables**
4. Agrega una nueva variable:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://barcodabazar.vercel.app`
   - **Environments**: Marca Production, Preview, y Development

5. Haz clic en **Save**
6. **Re-deploy tu aplicación** para que tome efecto

## Configuración en Google Cloud Console

Asegúrate de que en Google Cloud Console tengas configurado:

**Orígenes autorizados de JavaScript:**
- `https://xtxvfwhaloimarwwhezj.supabase.co`
- `http://localhost:3000`
- `https://barcodabazar.vercel.app` ✅ (tu sitio)

**URIs de redirección autorizados:**
- `https://xtxvfwhaloimarwwhezj.supabase.co/auth/v1/callback`
- `http://localhost:3000/auth/callback`
- `https://barcodabazar.vercel.app/auth/callback` ✅ (tu sitio)

## Configuración en Supabase

En el panel de Supabase, ve a **Authentication** > **URL Configuration** y verifica:

**Site URL:** ⚠️ **ESTO ES LO MÁS IMPORTANTE**
- ❌ NO uses: `http://localhost:3000`
- ✅ DEBES usar: `https://barcodabazar.vercel.app`

**El Site URL es lo que determina qué dominio muestra Google en el mensaje de OAuth.**
Si está configurado como `localhost:3000`, Google dirá "Accede a localhost:3000"
Si está configurado como tu dominio de producción, Google dirá "Accede a barcodabazar.vercel.app"

**Redirect URLs:**
Agrega las siguientes URLs:
- `http://localhost:3000/auth/callback`
- `https://barcodabazar.vercel.app/auth/callback`
- `https://barcodabazar.vercel.app/**` (wildcard para todas las rutas)

## Cómo Probar

1. **Local:**
   - Inicia sesión con Google
   - Deberías ver `http://localhost:3000` en el mensaje de Google

2. **Producción:**
   - Ve a `https://barcodabazar.vercel.app`
   - Inicia sesión con Google
   - Ahora deberías ver `https://barcodabazar.vercel.app` en lugar del dominio de Supabase

## Notas Importantes

- La variable `NEXT_PUBLIC_SITE_URL` DEBE estar configurada en Vercel
- Después de agregar la variable, debes hacer un **re-deploy**
- Si no está configurada, usará `window.location.origin` como fallback
- Para desarrollo local, seguirá usando localhost automáticamente
