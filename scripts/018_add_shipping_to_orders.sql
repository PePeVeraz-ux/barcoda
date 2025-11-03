-- Agregar columnas de envío a órdenes
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_boxes INTEGER DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN orders.shipping_cost IS 'Costo de envío en MXN';
COMMENT ON COLUMN orders.shipping_weight IS 'Peso total del envío en kilogramos';
COMMENT ON COLUMN orders.shipping_boxes IS 'Número de cajas necesarias para el envío';

-- Actualizar órdenes existentes con envío en 0
UPDATE orders 
SET shipping_cost = 0, shipping_weight = 0, shipping_boxes = 0
WHERE shipping_cost IS NULL;
