-- Migration: Add Supplier Link and Pricing Items
-- Date: 2026-05-28

-- 1. Add supplier_link to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_link TEXT;

-- 2. Create pricing_items table
CREATE TABLE IF NOT EXISTS public.pricing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL, -- Changed type to TEXT to match products(id) type
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    type TEXT,
    material TEXT,
    finish TEXT,
    extras TEXT,
    cost DECIMAL(12,2) DEFAULT 0.00,
    markup DECIMAL(12,2) DEFAULT 1.00,
    base_price DECIMAL(12,2) DEFAULT 0.00, -- competitor average price
    card_fee_percentage DECIMAL(5,2) DEFAULT 3.49,
    shipping_cost DECIMAL(12,2) DEFAULT 25.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "everyone_can_select_pricing" ON public.pricing_items;
DROP POLICY IF EXISTS "authenticated_can_modify_pricing" ON public.pricing_items;

-- Create policies for authenticated admins
CREATE POLICY "everyone_can_select_pricing" 
ON public.pricing_items FOR SELECT 
USING (true);

CREATE POLICY "authenticated_can_insert_pricing" 
ON public.pricing_items FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "authenticated_can_update_pricing" 
ON public.pricing_items FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "authenticated_can_delete_pricing" 
ON public.pricing_items FOR DELETE 
TO authenticated 
USING (true);
