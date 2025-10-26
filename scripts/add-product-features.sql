-- Agregar soporte para múltiples imágenes y características específicas

-- 1. Agregar columnas a la tabla products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::JSONB;

-- 2. Migrar imagen existente a array de imágenes
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 3. Comentarios para documentación
COMMENT ON COLUMN products.images IS 'Array de URLs de imágenes del producto (múltiples imágenes)';
COMMENT ON COLUMN products.features IS 'Array JSON de características específicas del producto, ej: [{"name": "Altura", "value": "30cm"}, {"name": "Material", "value": "PVC"}]';

-- 4. Ejemplo de cómo actualizar un producto con múltiples imágenes y características
-- UPDATE products
-- SET 
--   images = ARRAY[
--     'https://example.com/image1.jpg',
--     'https://example.com/image2.jpg',
--     'https://example.com/image3.jpg'
--   ],
--   features = '[
--     {"name": "Altura", "value": "30cm"},
--     {"name": "Material", "value": "PVC"},
--     {"name": "Articulaciones", "value": "20 puntos"},
--     {"name": "Accesorios", "value": "3 manos intercambiables, base"}
--   ]'::JSONB
-- WHERE id = 'product-id';

-- 5. Verificar que se agregaron las columnas
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('images', 'features')
ORDER BY ordinal_position;

-- 6. Ver ejemplo de datos
SELECT 
  id,
  name,
  image_url as old_image,
  images as new_images,
  features
FROM products
LIMIT 3;
