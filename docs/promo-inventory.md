# 🎟️ Panduan Promo & Integritas Stok

Sistem ini menggabungkan strategi marketing (Diskon) dengan keamanan data (Atomic Inventory).

## 1. Sistem Promo
*   **Tipe Diskon:** 
    *   `fixed`: Potongan harga tetap (misal: Diskon Rp 5.000).
    *   `percentage`: Potongan persentase (misal: Diskon 10%).
*   **Validasi:** Sistem akan mengecek `min_order_amount` dan `usage_limit` sebelum diskon diterapkan di keranjang.

## 2. Atomic Inventory (Inventory Rollback) 🛡️
Ini adalah fitur paling "Canggih" di proyek ini.
*   **Masalah:** Bagaimana jika stok sudah dikurangi tapi proses pembayaran/insert data pesanan gagal?
*   **Solusi:** Kita menggunakan mekanisme **Database Transaction/Rollback** di level Server Action.
*   **Alur:**
    1. Kurangi stok menu di tabel `menu_items`.
    2. Coba simpan data pesanan ke tabel `orders`.
    3. Jika langkah 2 gagal (error), sistem akan secara otomatis menjalankan perintah penambahan stok kembali ke angka semula.
    4. Ini menjamin stok di etalase selalu akurat bray.
