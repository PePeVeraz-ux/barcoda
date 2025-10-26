# Instrucciones para Configurar Usuario Admin

## Problema
Tu usuario en la base de datos tiene el rol "admin" pero no puedes acceder al panel de administración.

## Solución Implementada

### 1. Corrección en el Navbar
Se corrigió el componente `navbar.tsx` para que actualice correctamente el rol cuando cambias de sesión.

### 2. Verificar tu Usuario en Supabase

Ve a tu proyecto de Supabase y ejecuta esta consulta SQL:

```sql
-- Ver tu usuario actual
SELECT 
  p.id,
  u.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'tu-email@ejemplo.com';
```

### 3. Establecer Rol Admin

Si tu usuario NO tiene el rol "admin", ejecuta:

```sql
-- Reemplaza 'tu-email@ejemplo.com' con tu email real
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
```

### 4. Verificar la Columna 'role'

Si la tabla `profiles` no tiene la columna `role`, créala:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
```

### 5. Cerrar Sesión y Volver a Iniciar

1. Cierra sesión en la aplicación
2. Vuelve a iniciar sesión
3. Ahora deberías ver el enlace "Admin" en el navbar
4. Podrás acceder a `/admin`

## Estructura de la Base de Datos Requerida

Tu tabla `profiles` debe tener:
- `id` (UUID, primary key, references auth.users)
- `role` (TEXT, valores: 'user' o 'admin')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Rutas Protegidas

Las siguientes rutas verifican el rol admin:
- `/admin` - Dashboard principal
- `/admin/products` - Gestión de productos
- `/admin/products/new` - Crear producto
- `/admin/products/[id]/edit` - Editar producto
- `/admin/orders` - Gestión de órdenes

## Trigger Recomendado

Para crear automáticamente un perfil cuando se registra un usuario:

```sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (NEW.id, 'user', NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
