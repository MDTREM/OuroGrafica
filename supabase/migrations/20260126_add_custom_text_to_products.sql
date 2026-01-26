-- Add custom_text column to products table to store configuration
ALTER TABLE products ADD COLUMN custom_text JSONB DEFAULT NULL;
