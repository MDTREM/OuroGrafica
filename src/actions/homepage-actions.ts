'use server';

import { supabase } from '@/lib/supabase';

// Helper to remove special chars for filename
function sanitizeFilename(name: string) {
    return name.replace(/[^a-zA-Z0-9.]/g, '-');
}

export interface Banner {
    id: string;
    imageUrl: string;
    link?: string;
    mobileImageUrl?: string;
}

export type SectionType = 'banner-carousel' | 'info-banner' | 'categories' | 'product-row' | 'stacked-banners' | 'maintenance-cta';

export interface Section {
    id: string;
    type: SectionType;
    title?: string;
    name: string;
    enabled: boolean;
    banners?: Banner[];
    settings?: {
        filter?: 'best-sellers' | 'featured' | 'new' | 'custom';
        count?: number;
        productIds?: string[];
    };
    benefits?: {
        id: string;
        icon: string;
        title: string;
        subtitle: string;
    }[];
}

export interface HomepageConfig {
    sections: Section[];
}

export async function getHomepageConfig(): Promise<HomepageConfig> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'homepage')
            .single();

        if (error || !data) {
            // Return default config if not found
            return {
                sections: [
                    { id: 'def-1', type: 'banner-carousel', name: 'Carrossel Principal', enabled: true, banners: [] },
                    { id: 'def-2', type: 'maintenance-cta', name: 'Card de Manutenção', enabled: true },
                    { id: 'def-3', type: 'categories', name: 'Categorias', enabled: true, title: 'Departamentos' },
                    { id: 'def-4', type: 'product-row', name: 'Destaques', enabled: true, title: 'Produtos em Destaque', settings: { filter: 'best-sellers' } }
                ]
            };
        }

        return data.value as HomepageConfig;
    } catch (error) {
        console.error('Error reading homepage config:', error);
        return { sections: [] };
    }
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'homepage', value: config }, { onConflict: 'key' });

        if (error) {
            console.error('Supabase save error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error saving homepage config:', error);
        return false;
    }
}

export async function uploadImage(formData: FormData): Promise<string | null> {
    try {
        const file = formData.get('file') as File;
        if (!file) return null;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;

        const { data, error } = await supabase.storage
            .from('banners') // Using same bucket for simplicity
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('Supabase storage upload error:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('banners')
            .getPublicUrl(filename);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}
