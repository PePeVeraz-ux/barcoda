# Cómo Habilitar Google OAuth en Supabase

## Problema
Error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

## Solución

Necesitas habilitar Google OAuth en tu proyecto de Supabase. Sigue estos pasos:

### 1. Accede al Panel de Supabase
Ve a: https://supabase.com/dashboard

### 2. Selecciona tu Proyecto
Selecciona el proyecto: `xtxvfwhaloimarwwhezj`

### 3. Configurar Google OAuth

1. En el panel izquierdo, ve a **Authentication** > **Providers**
2. Busca **Google** en la lista de proveedores
3. Haz clic en **Google** para expandir las opciones
4. Activa el toggle **"Enable Sign in with Google"**

### 4. Obtener Credenciales de Google Cloud

Para que funcione, necesitas crear credenciales OAuth en Google Cloud Console:

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Si es tu primera vez, necesitarás configurar la pantalla de consentimiento:
   - Tipo de usuario: **External**
   - Nombre de la aplicación: **Barcoda Bazar**
   - Email de soporte: tu email
   - Dominio autorizado: tu dominio de producción (si lo tienes)
   - Email del desarrollador: tu email

6. Después de configurar la pantalla de consentimiento, vuelve a crear las credenciales:
   - Tipo de aplicación: **Web application**
   - Nombre: **Barcoda Bazar Web**
   - **Authorized JavaScript origins**:
     - `https://xtxvfwhaloimarwwhezj.supabase.co`
     - `http://localhost:3000` (para desarrollo local)
     - Tu URL de producción (si la tienes)
   - **Authorized redirect URIs**:
     - `https://xtxvfwhaloimarwwhezj.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo local)
     - Tu URL de producción + `/auth/callback` (si la tienes)

7. Guarda y copia el **Client ID** y **Client Secret**

### 5. Configurar en Supabase

1. Vuelve al panel de Supabase
2. En la configuración de Google OAuth, pega:
   - **Client ID**: El Client ID de Google
   - **Client Secret**: El Client Secret de Google
3. Guarda los cambios

### 6. URLs de Redirección

Asegúrate de que las siguientes URLs estén configuradas en Supabase:

**Authentication** > **URL Configuration**:
- **Site URL**: `http://localhost:3000` (desarrollo) o tu URL de producción
- **Redirect URLs**: Agrega las siguientes:
  - `http://localhost:3000/auth/callback`
  - Tu URL de producción + `/auth/callback`

### 7. Prueba

1. Ve a la página de login: http://localhost:3000/auth/login
2. Haz clic en **"Continúa con Google"**
3. Deberías ser redirigido a Google para autenticarte
4. Después de autenticarte, serás redirigido de vuelta a la aplicación

## Notas Importantes

- El proceso de configuración de Google OAuth puede tardar unos minutos en activarse
- Para producción, asegúrate de agregar las URLs correctas de tu dominio
- Si tienes problemas, verifica que las URLs de redirección coincidan exactamente
- Los usuarios que se autentiquen con Google se crearán automáticamente en la tabla `profiles` gracias al trigger de Supabase

## Alternativa: Desactivar Google OAuth

Si no quieres configurar Google OAuth en este momento, puedes:

1. Ocultar el botón de Google en la página de login
2. Usar solo autenticación por email/contraseña

Para hacer esto, edita el archivo `app/auth/login/page.tsx` y comenta o elimina la sección del botón de Google (líneas 97-131).
