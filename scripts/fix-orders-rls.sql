-- Arreglar políticas RLS para que admin vea TODAS las órdenes

-- 1. Ver políticas actuales de orders
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- 2. Eliminar políticas restrictivas de orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;

-- 3. Crear políticas permisivas

-- Usuarios pueden ver sus propias órdenes
CREATE POLICY "users_view_own_orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin puede ver TODAS las órdenes
CREATE POLICY "admin_view_all_orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Usuarios pueden crear sus propias órdenes
CREATE POLICY "users_create_own_orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin puede actualizar TODAS las órdenes (para cambiar estado)
CREATE POLICY "admin_update_all_orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. Asegurar que RLS esté habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Verificar que funcionó
SELECT 
  'Políticas RLS de orders actualizadas correctamente' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'orders';

-- 6. Ver las nuevas políticas
SELECT 
  policyname,
  cmd as comando,
  CASE 
    WHEN policyname LIKE '%admin%' THEN 'Admin'
    WHEN policyname LIKE '%users%' THEN 'Usuarios'
    ELSE 'Otro'
  END as tipo
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd, policyname;

-- 7. Probar que admin puede ver todas las órdenes
-- (Ejecuta esto después de aplicar las políticas)
-- SELECT COUNT(*) as total_orders FROM orders;
-- Debe mostrar TODAS las órdenes, no solo las del admin
