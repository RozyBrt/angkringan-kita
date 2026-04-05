-- ============================================
-- Angkringan Kita — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: menu_items
-- ============================================
create table if not exists menu_items (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null check (category in ('Minuman', 'Cemilan', 'Makanan')),
  description text,
  price       integer not null,  -- in IDR (no decimals needed)
  image_url   text,
  is_available boolean not null default true,
  created_at  timestamptz default now()
);

-- ============================================
-- TABLE: orders
-- ============================================
create table if not exists orders (
  id            uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  note          text,
  total_price   integer not null,
  status        text not null default 'pending' check (status in ('pending', 'done')),
  created_at    timestamptz default now()
);

-- ============================================
-- TABLE: order_items
-- ============================================
create table if not exists order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders (id) on delete cascade,
  menu_item_id uuid not null references menu_items (id),
  quantity     integer not null check (quantity > 0),
  subtotal     integer not null,
  created_at   timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- menu_items: anyone can read, only authenticated (admin) can write
alter table menu_items enable row level security;

create policy "Allow public read of menu_items"
  on menu_items for select
  using (true);

create policy "Allow authenticated write to menu_items"
  on menu_items for all
  using (auth.role() = 'authenticated');

-- orders: anyone can insert (customers place orders), only authenticated can read all
alter table orders enable row level security;

create policy "Allow public insert to orders"
  on orders for insert
  with check (true);

create policy "Allow authenticated to read and update orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated to update orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- order_items: anyone can insert, only authenticated can read all
alter table order_items enable row level security;

create policy "Allow public insert to order_items"
  on order_items for insert
  with check (true);

create policy "Allow public to read their own order_items"
  on order_items for select
  using (true);

create policy "Allow authenticated to manage order_items"
  on order_items for all
  using (auth.role() = 'authenticated');

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_order_items_order_id on order_items (order_id);
create index if not exists idx_menu_items_category on menu_items (category);
