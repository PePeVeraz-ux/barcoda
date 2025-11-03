-- Agregar columna de peso a productos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2) DEFAULT 0.25;

-- Comentario
COMMENT ON COLUMN products.weight IS 'Peso del producto en kilogramos (default: 0.25kg)';

-- Actualizar productos existentes con peso estimado (250 gramos por figura)
UPDATE products 
SET weight = 0.25 
WHERE weight IS NULL OR weight = 0;
