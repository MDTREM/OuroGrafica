'use server';

import { supabase } from '@/lib/supabase';

export interface QuoteRequest {
    id: string;
    created_at: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name: string;
    cnpj: string;
    job_title?: string;
    equipment_qty: number;
    print_volume: string;
    area_of_operation: string;
    message: string;
    status: 'new' | 'contacted' | 'closed';
}

export type QuoteFormInput = Omit<QuoteRequest, 'id' | 'created_at' | 'status'>;

export async function submitQuoteRequest(data: QuoteFormInput) {
    try {
        const { error } = await supabase
            .from('quote_requests')
            .insert([
                {
                    ...data,
                    status: 'new'
                }
            ]);

        if (error) {
            console.error('Error submitting quote:', error);
            return { success: false, error: 'Erro ao enviar solicitação.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error submitting quote:', error);
        return { success: false, error: 'Erro inesperado.' };
    }
}

export async function getQuoteRequests() {
    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching quotes:', error);
            return [];
        }

        return data as QuoteRequest[];
    } catch (error) {
        console.error('Unexpected error fetching quotes:', error);
        return [];
    }
}

export async function updateQuoteStatus(id: string, status: string) {
    try {
        const { error } = await supabase
            .from('quote_requests')
            .update({ status })
            .eq('id', id);

        if (error) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}
