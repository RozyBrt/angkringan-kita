# Supabase Security & Logic Update (Sprint 1)

Jalankan script SQL ini di **Supabase SQL Editor** untuk mengaktifkan RLS, kebijakan keamanan, dan generator kode pesanan otomatis.

```sql
-- 1. Generator Order Code (8 Digit Unik)
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN := false;
BEGIN
  WHILE NOT done LOOP
    -- Generasi kode random 8 karakter (Alfanumerik)
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    -- Pastikan kode belum pernah dipakai
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = new_code) THEN
      done := true;
    END IF;
  END LOOP;
  NEW.order_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Tambah kolom order_code ke tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE;

-- 3. Pasang Trigger
DROP TRIGGER IF EXISTS tr_generate_order_code ON orders;
CREATE TRIGGER tr_generate_order_code
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_code();

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. Policy: INSERT (Public - Biar pelanggan bisa mesen)
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" ON orders
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert items" ON order_items;
CREATE POLICY "Public can insert items" ON order_items
FOR INSERT WITH CHECK (true);

-- 6. Policy: SELECT (Public - Tapi harus tau order_code atau ID)
DROP POLICY IF EXISTS "Public can select via order_code" ON orders;
CREATE POLICY "Public can select via order_code" ON orders
FOR SELECT USING (true); -- Filter dilakukan di sisi aplikasi lewat query

-- 7. Policy: UPDATE (Hanya Authenticated/Admin)
DROP POLICY IF EXISTS "Only authenticated can update orders" ON orders;
CREATE POLICY "Only authenticated can update orders" ON orders
FOR UPDATE TO authenticated USING (true);
```

### Note Penting:
1.  **Audio File:** Pastikan file suara ditaruh di `public/sounds/notification.mp3`.
2.  **RLS Update:** Policy `UPDATE` sekarang terkunci hanya untuk user yang login (Authenticated). Pelanggan tidak akan bisa iseng ngerubah status pesanan lewat browser console.
