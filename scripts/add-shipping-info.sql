-- Add shipping information columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT;

-- Add comment to document the changes
COMMENT ON COLUMN public.orders.shipping_name IS 'Full name for shipping';
COMMENT ON COLUMN public.orders.shipping_address IS 'Shipping street address';
COMMENT ON COLUMN public.orders.shipping_city IS 'Shipping city';
COMMENT ON COLUMN public.orders.shipping_postal_code IS 'Shipping postal code';
COMMENT ON COLUMN public.orders.shipping_phone IS 'Contact phone number for shipping';
