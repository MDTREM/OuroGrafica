'use server';

import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src/data/homepage-config.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/banners');

export interface Banner {
    id: string;
    imageUrl: string;
    link?: string;
    mobileImageUrl?: string;
}

export type SectionType = 'banner-carousel' | 'info-banner' | 'categories' | 'product-row' | 'stacked-banners';

export interface Section {
    id: string;
    type: SectionType;
    title?: string; // Display title for the section (e.g. "Mais Vendidos")
    name: string; // Internal name (e.g. "Seção de Destaque")
    enabled: boolean;
    banners?: Banner[]; // Scoped banners for this section
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

// Ensure upload directory exists
async function ensureUploadDir() {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
}

export async function getHomepageConfig(): Promise<HomepageConfig> {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading homepage config:', error);
        return {
            sections: []
        };
    }
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<boolean> {
    try {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving homepage config:', error);
        return false;
    }
}

export async function uploadBannerImage(formData: FormData): Promise<string | null> {
    try {
        const file = formData.get('file') as File;
        if (!file) return null;

        await ensureUploadDir();

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await fs.writeFile(filepath, buffer);

        return `/uploads/banners/${filename}`;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}
