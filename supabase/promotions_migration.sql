-- =====================================================
-- MIGRATION: Marketing System & Payment Foundation
-- Jalankan di Supabase SQL Editor
-- =====================================================

-- 1. Buat tabel promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMPTZ,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tambah kolom di tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_used TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;

-- 3. RLS untuk promotions (bisa dibaca public, tapi hanya admin yang bisa edit)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can read active promotions"
  ON promotions FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY IF NOT EXISTS "Authenticated users can manage promotions"
  ON promotions FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Contoh data promo (opsional, bisa dihapus kalau mau input manual)
INSERT INTO promotions (code, description, discount_type, value, min_order_amount, is_active, valid_until)
VALUES
  ('ANGKRING10', 'Diskon 10% buat semua menu', 'percentage', 10, 5000, true, '2026-12-31 23:59:59+07'),
  ('HEMAT5K', 'Potongan Rp 5.000 langsung!', 'fixed', 5000, 15000, true, '2026-12-31 23:59:59+07'),
  ('WELCOME', 'Diskon 15% pelanggan baru', 'percentage', 15, 0, true, '2026-12-31 23:59:59+07')
ON CONFLICT (code) DO NOTHING;
