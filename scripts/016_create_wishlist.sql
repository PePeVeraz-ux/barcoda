-- Crear tabla de wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS wishlist_items_product_id_idx ON wishlist_items(product_id);

-- RLS Policies
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver solo sus propios favoritos
CREATE POLICY "Users can view their own wishlist items"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden agregar a su wishlist
CREATE POLICY "Users can insert their own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar de su wishlist
CREATE POLICY "Users can delete their own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE wishlist_items IS 'Lista de deseos/favoritos de usuarios';
COMMENT ON COLUMN wishlist_items.user_id IS 'Usuario dueño del favorito';
COMMENT ON COLUMN wishlist_items.product_id IS 'Producto marcado como favorito';
