-- Coupons table and related fields
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_subtotal NUMERIC(10, 2) DEFAULT 0,
  max_subtotal NUMERIC(10, 2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.carts
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coupons readable" ON public.coupons;
CREATE POLICY "Coupons readable"
  ON public.coupons FOR SELECT
  TO authenticated, anon
  USING (active = TRUE);

DROP POLICY IF EXISTS "Coupons admin manage" ON public.coupons;
CREATE POLICY "Coupons admin manage"
  ON public.coupons FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin');
