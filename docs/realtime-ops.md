# 📡 Panduan Real-time & Kontrol Operasional

Sistem ini menggunakan **Supabase Realtime** untuk memastikan sinkronisasi data instan antara Admin dan Pelanggan.

## 1. Sinkronisasi Meja (Table Tracking)
*   **Trigger:** Setiap kali ada pesanan baru yang masuk ke tabel `orders` dengan status selain 'Selesai'.
*   **Alur:** 
    1. Pelanggan buka halaman Checkout.
    2. Frontend menjalankan `getOccupiedTables()` untuk mencari meja yang sedang ada pesanan aktif.
    3. Listener di frontend mendengarkan perubahan pada tabel `orders`. Jika ada pesanan baru/update, grid meja otomatis update warna (Merah = Penuh, Hijau = Kosong).

## 2. Kontrol Status Toko (Hybrid System)
Toko bisa diatur dalam 3 mode lewat Admin Dashboard:
1.  **AUTO:** Menggunakan logika jam di `page.tsx` (Buka jam 17:00 - 23:59).
2.  **OPEN:** Memaksa status buka di luar jam operasional.
3.  **CLOSED:** Memaksa status tutup meskipun sudah masuk jam operasional.

## 3. Mekanisme Gembok (Security Ordering Lock)
*   Jika status toko `CLOSED`, variabel `isOpen` di frontend menjadi `false`.
*   Di **`MenuCard.tsx`**, tombol "Tambah" akan di-disable.
*   Di **`checkout/page.tsx`**, tombol "Bayar" akan di-disable dan fungsi submit akan memunculkan error jika dipaksa.
*   Ini menjamin integritas bisnis agar tidak ada pesanan masuk saat dapur sudah tutup.
