'use server';

import { supabase } from '@/lib/supabase';
import { Product } from '@/data/mockData';

// ... existing code ...

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            ...data,
            customText: data.custom_text,
            hasDesignOption: data.has_design_option !== undefined ? data.has_design_option : true,
            priceBreakdowns: data.price_breakdowns || {}
        } as Product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}
