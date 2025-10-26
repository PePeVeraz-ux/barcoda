-- Script para establecer un usuario como administrador
-- Ejecuta este script en el SQL Editor de Supabase

-- Opción 1: Si conoces el email del usuario
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');

-- Opción 2: Si conoces el ID del usuario
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'tu-user-id-aqui';

-- Opción 3: Ver todos los usuarios y sus roles actuales
SELECT 
  p.id,
  u.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- Nota: Asegúrate de que la tabla profiles tenga la columna 'role'
-- Si no existe, créala con:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
