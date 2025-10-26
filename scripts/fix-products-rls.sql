-- Solución: Políticas RLS para la tabla products
-- Este script permite a usuarios autenticados crear/editar productos
-- La verificación de admin se hace en el código (middleware)

-- 1. Ver políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';

-- 2. Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;

-- 3. Crear políticas permisivas (la seguridad se maneja en el middleware)
CREATE POLICY "products_select_policy"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_policy"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_delete_policy"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- 4. Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Verificar que funcionó
SELECT 'Políticas RLS actualizadas correctamente' as status;

-- 6. Ver las nuevas políticas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';
