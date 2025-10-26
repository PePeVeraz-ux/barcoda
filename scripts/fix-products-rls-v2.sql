-- Solución v2: Eliminar TODAS las políticas y crear nuevas
-- Ejecuta este script completo en Supabase SQL Editor

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes de products
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', r.policyname);
    END LOOP;
END $$;

-- 3. Crear políticas nuevas y simples
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

-- 4. Habilitar RLS nuevamente
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Verificar que funcionó
SELECT 
  'Políticas actualizadas correctamente' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'products';

-- 6. Ver las políticas creadas
SELECT 
  policyname,
  cmd as comando,
  CASE 
    WHEN qual IS NULL THEN 'Sin restricción'
    ELSE 'Con restricción'
  END as tipo
FROM pg_policies
WHERE tablename = 'products'
ORDER BY cmd;
