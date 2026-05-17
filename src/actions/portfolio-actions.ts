'use server';

import { supabase as staticSupabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface PortfolioCase {
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    content: string;
    cover_image: string;
    images: string[];
    published: boolean;
    created_at: string;
    updated_at?: string;
}

// Helper to create authenticated client from token
function createAuthClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        }
    );
}

export async function getCases(limit?: number) {
    try {
        let query = staticSupabase
            .from('portfolio_cases')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as PortfolioCase[];
    } catch (error) {
        console.error('Error fetching portfolio cases:', error);
        return [];
    }
}

export async function getAllCasesAdmin() {
    try {
        const { data, error } = await staticSupabase
            .from('portfolio_cases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as PortfolioCase[];
    } catch (error) {
        console.error('Error fetching admin portfolio cases:', error);
        return [];
    }
}

export async function getCaseBySlug(slug: string) {
    try {
        const { data, error } = await staticSupabase
            .from('portfolio_cases')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data as PortfolioCase;
    } catch (error) {
        console.error('Error fetching portfolio case:', error);
        return null;
    }
}

export async function saveCase(portfolioCase: Partial<PortfolioCase>, token?: string) {
    try {
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Token não fornecido.' };
        }

        const supabase = createAuthClient(token);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return { success: false, error: 'Sessão inválida ou expirada.' };
        }

        const payload = {
            ...portfolioCase,
            slug: portfolioCase.slug || portfolioCase.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('portfolio_cases')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/portfolio');
        revalidatePath(`/portfolio/${data.slug}`);
        revalidatePath('/admin/portfolio');

        return { success: true, data };
    } catch (error: any) {
        console.error('Error saving portfolio case:', error);
        return { success: false, error: error.message || 'Erro desconhecido ao salvar case' };
    }
}

export async function deleteCase(id: string, token?: string) {
    try {
        if (!token) {
            console.error('Delete failed: No token provided');
            return { success: false, error: 'Usuário não autenticado' };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('Delete failed: Auth error or no user', authError);
            return { success: false, error: 'Sessão inválida ou expirada' };
        }

        const { error } = await supabase
            .from('portfolio_cases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete failed: Supabase error', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/portfolio');
        revalidatePath('/admin/portfolio');
        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteCase action:', error);
        return { success: false, error: error.message || 'Erro interno ao excluir case' };
    }
}
