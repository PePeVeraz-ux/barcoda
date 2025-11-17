-- Add sale-related fields to products for promotional discounts
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS sale_active BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sale_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_applied_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS sale_percentage NUMERIC(5,2);
