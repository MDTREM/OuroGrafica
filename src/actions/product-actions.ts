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

// Helper to map DB columns to Product interface
export function mapProduct(p: any): Product {
    return {
        ...p,
        customText: p.custom_text,
        hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : true,
        priceBreakdowns: p.price_breakdowns || {}
    } as Product;
}

export async function getProductsByCategory(
    categorySlug: string,
    options?: { minPrice?: number; maxPrice?: number; shipping?: string; deadline?: string; subcategorySlug?: string }
): Promise<Product[]> {
    try {
        // ... (query logic remains same, just replacing return)
        let query = supabase
            .from('products')
            .select('*')
            // Use ilike to handle case sensitivity issues (e.g. "Banners" vs "banners")
            .ilike('category', categorySlug)
            .eq('active', true);

        if (options?.subcategorySlug) {
            query = query.eq('subcategory', options.subcategorySlug);
        }

        if (options?.minPrice !== undefined) {
            query = query.gte('price', options.minPrice);
        }

        if (options?.maxPrice !== undefined) {
            query = query.lte('price', options.maxPrice);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data.map(mapProduct);
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
