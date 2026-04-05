-- ============================================
-- Angkringan Kita — Seed Data Tambahan
-- Run in your Supabase SQL Editor
-- ============================================

-- (Pilihan) Jika kamu ingin mereset menu dan pesanan, hapus tanda komentar pada dua baris di bawah ini:
-- TRUNCATE TABLE order_items, orders CASCADE;
-- TRUNCATE TABLE menu_items CASCADE;

insert into menu_items (name, category, description, price, image_url, is_available)
values
  -- MINUMAN BARU
  (
    'Kopi Susu Gula Aren',
    'Minuman',
    'Perpaduan espresso robusta khas angkringan dengan susu segar dan legitnya gula aren asli.',
    12000,
    'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80',
    true
  ),
  (
    'Teh Kampul Hangat',
    'Minuman',
    'Teh khas Solo dengan irisan jeruk peras asli beserta kulitnya. Legit, sepet, segar!',
    7000,
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
    true
  ),
  (
    'Es Jahe Susu',
    'Minuman',
    'Susu kental manis hangat dengan geprekan jahe bakar dan es batu. Mengusir masuk angin sekaligus menyegarkan.',
    10000,
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    true
  ),
  (
    'Wedang Telang',
    'Minuman',
    'Minuman sehat dari bunga telang ungu. Disajikan hangat lengkap dengan serai dan pandan.',
    8000,
    'https://images.unsplash.com/photo-1626353995876-0bf8417c8022?w=400&q=80',
    true
  ),

  -- CEMILAN BARU
  (
    'Sate Telur Puyuh',
    'Cemilan',
    'Telur puyuh bumbu kecap meresap sampai ke kuningnya. Teman wajib makan nasi kucing.',
    4000,
    'https://images.unsplash.com/photo-1625860633266-9abf0b48451c?w=400&q=80',
    true
  ),
  (
    'Sate Usus Ayam Bacem',
    'Cemilan',
    'Usus ayam bersih dibacem manis lalu dibakar sebentar. Gurih tanpa bau amis.',
    3000,
    'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80',
    true
  ),
  (
    'Sate Keong Sawah',
    'Cemilan',
    'Keong sawah kaya protein dengan bumbu pedas manis rahasia angkringan.',
    3500,
    'https://images.unsplash.com/photo-1600806497931-e1ef2b8bfbc0?w=400&q=80',
    true
  ),
  (
    'Tahu Bakso Goreng',
    'Cemilan',
    'Tahu walik isi adonan bakso padat, digoreng garing. Paling cocok dicocol saus.',
    6000,
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80',
    true
  ),
  (
    'Pisang Bakar Coklat Keju',
    'Cemilan',
    'Pisang gepeng dibakar arang, disiram susu kental manis, seres coklat, dan parutan keju melimpah.',
    12000,
    'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&q=80',
    true
  ),

  -- MAKANAN BARU
  (
    'Nasi Kucing Teri Medan',
    'Makanan',
    'Nasi hangat bungkus daun pisang dengan sambal teri asin pedas nendang.',
    5000,
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80',
    true
  ),
  (
    'Nasi Kucing Bandeng Presto',
    'Makanan',
    'Nasi kucing dengan potongan bandeng presto tulang lunak dan sambal terasi.',
    5500,
    'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80',
    true
  ),
  (
    'Mie Godog Jawa',
    'Makanan',
    'Mie rebus dengan telur bebek, suwiran ayam, kubis, tomat, dimasak pakai tungku arang. Wajib nunggu ya.',
    18000,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    true
  ),
  (
    'Indomie Telur Kornet',
    'Makanan',
    'Bukan sekadar Indomie biasa. Kuah nyemek dengan telur setengah matang dan kornet sapi asli.',
    15000,
    'https://images.unsplash.com/photo-1612929633738-8fe01f7c8166?w=400&q=80',
    true
  );
