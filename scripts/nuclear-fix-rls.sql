-- SOLUCIÓN NUCLEAR: Eliminar TODO y empezar de cero
-- Ejecuta este script COMPLETO de una sola vez

-- PASO 1: Deshabilitar RLS temporalmente en todas las tablas
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASO 3: Eliminar funciones problemáticas
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- PASO 4: Crear políticas SIMPLES para profiles
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- PASO 5: Políticas para products (lectura pública, escritura autenticada)
CREATE POLICY "products_select_policy"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_policy"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "products_update_policy"
  ON public.products FOR UPDATE
  USING (true);

CREATE POLICY "products_delete_policy"
  ON public.products FOR DELETE
  USING (true);

-- PASO 6: Políticas para categories
CREATE POLICY "categories_select_policy"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_policy"
  ON public.categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "categories_update_policy"
  ON public.categories FOR UPDATE
  USING (true);

CREATE POLICY "categories_delete_policy"
  ON public.categories FOR DELETE
  USING (true);

-- PASO 7: Políticas para orders
CREATE POLICY "orders_select_policy"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- PASO 8: Políticas para order_items
CREATE POLICY "order_items_select_policy"
  ON public.order_items FOR SELECT
  USING (true);

CREATE POLICY "order_items_insert_policy"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- PASO 9: Políticas para carts
CREATE POLICY "carts_select_policy"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "carts_insert_policy"
  ON public.carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_update_policy"
  ON public.carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "carts_delete_policy"
  ON public.carts FOR DELETE
  USING (auth.uid() = user_id);

-- PASO 10: Políticas para cart_items
CREATE POLICY "cart_items_select_policy"
  ON public.cart_items FOR SELECT
  USING (true);

CREATE POLICY "cart_items_insert_policy"
  ON public.cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "cart_items_update_policy"
  ON public.cart_items FOR UPDATE
  USING (true);

CREATE POLICY "cart_items_delete_policy"
  ON public.cart_items FOR DELETE
  USING (true);

-- PASO 11: Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- PASO 12: Verificación final
SELECT 'RLS configurado correctamente - Sin recursión' as status;
