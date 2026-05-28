'use server';

import { supabase as staticSupabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface BrandingSubmission {
    id: string;
    name: string;
    store_name: string;
    email: string;
    cnpj?: string;
    whatsapp: string;
    orders_per_day: string;
    monthly_revenue: string;
    niche: string;
    brand_details?: string;
    selected_plan?: string;
    status: 'pending' | 'contacted' | 'completed';
    created_at: string;
    updated_at: string;
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

export async function submitBrandingForm(submission: Omit<BrandingSubmission, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    try {
        const { error } = await staticSupabase
            .from('branding_submissions')
            .insert([submission]);

        if (error) throw error;
        
        revalidatePath('/admin/branding');
        return { success: true };
    } catch (error: any) {
        console.error('Error submitting branding form:', error);
        return { success: false, error: error.message || 'Erro desconhecido ao enviar formulário' };
    }
}

export async function getBrandingSubmissions(token?: string) {
    try {
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Token não fornecido.' };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return { success: false, error: 'Sessão inválida ou expirada.' };
        }

        const { data, error } = await supabase
            .from('branding_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data as BrandingSubmission[] };
    } catch (error: any) {
        console.error('Error fetching branding submissions:', error);
        return { success: false, error: error.message || 'Erro desconhecido ao buscar formulários' };
    }
}

export async function updateSubmissionStatus(id: string, status: 'pending' | 'contacted' | 'completed', token?: string) {
    try {
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Token não fornecido.' };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return { success: false, error: 'Sessão inválida ou expirada.' };
        }

        const { data, error } = await supabase
            .from('branding_submissions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        revalidatePath('/admin/branding');
        return { success: true, data };
    } catch (error: any) {
        console.error('Error updating branding submission status:', error);
        return { success: false, error: error.message || 'Erro ao atualizar status' };
    }
}

export async function deleteSubmission(id: string, token?: string) {
    try {
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Token não fornecido.' };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return { success: false, error: 'Sessão inválida ou expirada.' };
        }

        const { error } = await supabase
            .from('branding_submissions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/branding');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting branding submission:', error);
        return { success: false, error: error.message || 'Erro ao deletar formulário' };
    }
}
