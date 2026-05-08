# ⭐ Panduan Sistem Loyalty Poin

Sistem poin di Angkringan Kita dirancang untuk meningkatkan *customer retention* tanpa mengharuskan pelanggan membuat akun (Loginless Loyalty).

## 1. Konsep Dasar
*   **Kurs Poin:** 1 Poin = Rp 1.
*   **Persentase Cashback:** 10% dari total belanja (setelah diskon promo).
*   **Penyimpanan:** Data poin disimpan di `localStorage` browser pelanggan dengan key `angkringan_loyalty_points`.

## 2. Alur Mendapatkan Poin
1. Pelanggan melakukan checkout pesanan.
2. Server Action (`checkoutOrder`) menghitung total belanja akhir.
3. Server membalas dengan `pointsEarned` (Total Akhir × 0.1).
4. Di sisi frontend (`checkout/page.tsx`), sistem mengambil nilai poin lama dari `localStorage`, menjumlahkannya dengan poin baru, lalu menyimpannya kembali.

## 3. Alur Penukaran (Redeem) Poin
1. Di halaman Keranjang (`/cart`), pelanggan bisa menukarkan poin mereka.
2. Sistem akan mengecek:
    * Apakah pelanggan punya poin?
    * Apakah poin yang mau ditukarkan melebihi total belanja? (Tidak boleh gratis 100% bray, minimal bayar Rp 1).
3. Jika valid, poin akan dikonversi menjadi potongan harga langsung.
4. Poin yang sudah dipakai akan langsung dipotong dari `localStorage` setelah transaksi sukses.

## 4. Kelebihan & Celah
*   **Kelebihan:** Sangat cepat, ringan, dan pelanggan nggak ribet daftar akun.
*   **Celah (Hole):** Karena disimpan di browser, pelanggan yang pinter bisa edit poin via *Inspect Element*. 
*   **Solusi Masa Depan:** Pindahkan penyimpanan poin ke tabel `profiles` di Supabase dan gunakan sistem login.
