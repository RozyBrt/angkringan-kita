-- ==========================================
-- SCRIPT PEMBERSIHAN DATA DUMMY (GRAND LAUNCH)
-- ==========================================
-- PERINGATAN: Jalankan ini cuma kalau lu mau hapus SEMUA riwayat pesanan
-- Data Menu dan Kategori TIDAK akan terhapus.

-- 1. Hapus semua detail item pesanan
DELETE FROM order_items;

-- 2. Hapus semua data pesanan
DELETE FROM orders;

-- 3. Reset statistik penggunaan promo (Opsional)
UPDATE promotions SET usage_count = 0;

-- 4. Reset sequence ID (Biar ID mulai dari 1 lagi kalau pake autoincrement)
-- Cuma perlu kalau lu pake tipe Serial/BigSerial, kalau UUID abaikan aja bray.
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

COMMIT;

-- Database lu sekarang SUCI kembali bray! Siap dipake jualan beneran. 🍢🚀
