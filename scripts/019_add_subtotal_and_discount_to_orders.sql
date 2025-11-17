-- Add subtotal and discount columns expected by the new order workflow
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

COMMENT ON COLUMN public.orders.subtotal IS 'Subtotal del pedido antes de descuentos y envío';
COMMENT ON COLUMN public.orders.discount_amount IS 'Monto total de descuentos aplicados al pedido';
