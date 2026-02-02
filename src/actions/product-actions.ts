'use server';

import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/data/mockData';

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', slug) // Assuming 'id' is the slug as per mockData
            .single();

        if (error || !data) {
            console.error('Error fetching category:', error);
            // Fallback for demo if DB is empty (optional, but good for stability)
            return null;
        }

        return data as Category;
    } catch (error) {
        console.error('Unexpected error fetching category:', error);
        return null;
    }
}

export async function getProductsByCategory(
    categorySlug: string,
    options?: { minPrice?: number; maxPrice?: number; shipping?: string; deadline?: string; subcategorySlug?: string }
): Promise<Product[]> {
    try {
        let query = supabase
            .from('products')
            .select('*')
            .eq('category', categorySlug)
            .eq('active', true);

        if (options?.subcategorySlug) {
            // Filter by subcategory ID/Slug directly
            // The Admin saves the ID (which is usually the slug) into the 'subcategory' column
            query = query.eq('subcategory', options.subcategorySlug);
        }

        if (options?.minPrice !== undefined) {
            query = query.gte('price', options.minPrice);
        }

        if (options?.maxPrice !== undefined) {
            query = query.lte('price', options.maxPrice);
        }

        // Note: Assuming 'shipping_info' or similar column exists, or we filter locally. 
        // For now, if there are specific "shipping" columns, we use them. 
        // If not, we might need to skip strict DB filtering for shipping if unknown.
        // Given 'mockData' had simple fields, I'll stick to price for DB for now.

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data.map((p: any) => ({
            ...p,
            customText: p.custom_text,
            hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : true,
            priceBreakdowns: p.price_breakdowns || {}
        })) as Product[];
    } catch (error) {
        console.error('Unexpected error fetching products:', error);
        return [];
    }
}

export async function getAllCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            return [];
        }
        return data as Category[];
    } catch (error) {
        return [];
    }
}
