-- Migration untuk Inventory System (Tier 3)
-- Silakan jalankan ini di SQL Editor Supabase!

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_track_stock BOOLEAN DEFAULT FALSE;

-- (Opsional) Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
