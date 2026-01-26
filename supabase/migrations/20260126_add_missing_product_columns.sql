-- Add missing columns to products table to match frontend payload
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_per_m2 NUMERIC DEFAULT NULL;
