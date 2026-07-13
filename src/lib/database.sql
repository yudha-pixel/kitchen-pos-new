-- Kitchen POS Database Schema for Supabase
-- UUID-based schema for improved scalability and offline-first support

-- 1. Setup Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Profil (User/Kasir)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'cashier'
);

-- Index for profile lookups
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- 3. Tabel Kategori Produk
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Index for category lookups
CREATE INDEX idx_categories_name ON categories(name);

-- 4. Tabel Produk
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  image_url TEXT,
  sku TEXT UNIQUE
);

-- Indexes for product queries
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);

-- 5. Tabel Modifier (Extra Keju, Level Pedas, dll)
CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_extra DECIMAL(12,2) DEFAULT 0
);

-- Indexes for modifier queries
CREATE INDEX idx_modifiers_product_id ON modifiers(product_id);
CREATE INDEX idx_modifiers_name ON modifiers(name);

-- 6. Tabel Transaksi Utama
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  table_number TEXT,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  rounding_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT
);

-- Indexes for order queries
CREATE INDEX idx_orders_cashier_id ON orders(cashier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_table_number ON orders(table_number);

-- 7. Tabel Item Transaksi
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  price_at_time DECIMAL(12,2) NOT NULL,
  modifiers_applied JSONB,
  discount_item DECIMAL(12,2) DEFAULT 0,
  split_group_id TEXT
);

-- Indexes for order item queries
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_split_group_id ON order_items(split_group_id);

-- 8. Tabel Void Logs (Pembatalan Item)
CREATE TABLE IF NOT EXISTS order_void_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  reason TEXT NOT NULL,
  cashier_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for void log queries
CREATE INDEX idx_order_void_logs_order_id ON order_void_logs(order_id);
CREATE INDEX idx_order_void_logs_cashier_id ON order_void_logs(cashier_id);
CREATE INDEX idx_order_void_logs_created_at ON order_void_logs(created_at DESC);

-- Sync Queue Table (for offline-first support)
-- Queue for storing offline transactions to sync when online
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for sync queue queries
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_table_name ON sync_queue(table_name);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
