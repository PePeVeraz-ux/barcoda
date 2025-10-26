-- Script para probar las políticas RLS y verificar acceso admin

-- 1. Verificar que la función is_admin() existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';

-- 2. Verificar tu usuario y rol
SELECT 
  u.id,
  u.email,
  p.role,
  p.id IS NOT NULL as profile_exists
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'pepeveras845@gmail.com';

-- 3. Probar la función is_admin() manualmente
-- (Esto solo funciona si estás autenticado en la sesión SQL)
SELECT public.is_admin() as soy_admin;

-- 4. Ver todas las políticas en la tabla profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'orders', 'products', 'categories');

-- 6. Si RLS está causando problemas, temporalmente puedes deshabilitarlo para testing:
-- ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 7. Para volver a habilitarlo:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
