-- Add has_design_option column to products table
-- Default to TRUE so existing products continue to show the upload/hire section
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_design_option BOOLEAN DEFAULT TRUE;
