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

        if (error || !data) {
            // Fallback to mock data
            const { PRODUCTS } = await import('@/data/mockData');
            return PRODUCTS.find(p => p.id === id) || PRODUCTS[0] || null;
        };

        const { mapProduct } = await import('@/lib/product-mapper');
        return mapProduct(data);
    } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to mock data on error
        const { PRODUCTS } = await import('@/data/mockData');
        return PRODUCTS.find(p => p.id === id) || PRODUCTS[0] || null;
    }
}
