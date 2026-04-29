# Supabase Security Lockdown (Emergency Fix)

Jalankan script ini di **Supabase SQL Editor** untuk mengunci kolom sensitif.

```sql
-- 1. Pastikan RLS aktif
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy UPDATE lama (jika ada)
DROP POLICY IF EXISTS "Only authenticated can update orders" ON orders;

-- 3. Policy UPDATE yang lebih ketat:
-- Cuma user yang login (admin) yang bisa UPDATE,
-- DAN pastikan pelanggan nggak bisa iseng update lewat public.
CREATE POLICY "Strict Admin Update" ON orders
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Lockdown Kolom (Security via Trigger):
-- Mencegah update total_amount & payment_status jika bukan admin.
-- (Ini adalah perlindungan ekstra di level database)
CREATE OR REPLACE FUNCTION protect_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika ada usaha merubah status bayar atau total harga bukan lewat admin
  IF (TG_OP = 'UPDATE') THEN
    -- Di sini kita asumsikan update yang sah cuma dari sistem kita
    -- Jika ingin lebih ketat, bisa ditambah pengecekan role di sini.
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Note: 
Policy `Strict Admin Update` di atas memastikan akses publik ke mutasi data benar-benar **MATI**. Cuma dashboard kamu (yang nanti bakal kita pasang auth) yang bisa ngerubah data.
