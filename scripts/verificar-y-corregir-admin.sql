-- PASO 1: Ver el estado actual de tu usuario
SELECT 
  u.id,
  u.email,
  p.role,
  LENGTH(p.role) as role_length,
  p.role = 'admin' as is_exact_admin
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'pepeveras845@gmail.com';

-- PASO 2: Si el resultado muestra que role NO es 'admin', ejecuta esto:
-- (Descomenta las siguientes líneas quitando los --)

-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'pepeveras845@gmail.com');

-- PASO 3: Verificar que funcionó
-- SELECT u.email, p.role 
-- FROM profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email = 'pepeveras845@gmail.com';
