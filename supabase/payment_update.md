# Supabase Payment Update (Sprint 2)

Jalankan script SQL ini di **Supabase SQL Editor** untuk menambahkan fitur pembayaran dan invoice.

```sql
-- 1. Tambah kolom payment_status (default unpaid)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- 2. Tambah kolom payment_method (default Tunai)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Tunai';

-- 3. Update data lama (opsional) biar nggak NULL
UPDATE orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;
UPDATE orders SET payment_method = 'Tunai' WHERE payment_method IS NULL;
```

### Note Penting:
*   **Enum Manual:** Karena Supabase terkadang ribet dengan `ENUM` via SQL (bisa bentrok kalau sudah ada), kita pakai `TEXT` biasa saja tapi di sisi aplikasi (TypeScript) kita batasi inputnya.
*   **RLS:** Pastikan policy `UPDATE` yang kita buat di Sprint 1 sudah aktif, karena fitur pembayaran ini sangat bergantung pada keamanan akses admin.
