'use server';

import { supabase } from '@/lib/supabase';

export interface MaintenanceRequest {
    id: string;
    created_at: string;
    name: string;
    whatsapp: string;
    brand: string;
    model?: string;
    problem_description: string;
    status: 'new' | 'contacted' | 'closed';
}

export type MaintenanceFormInput = Omit<MaintenanceRequest, 'id' | 'created_at' | 'status'>;

export async function submitMaintenanceRequest(data: MaintenanceFormInput) {
    try {
        const { error } = await supabase
            .from('maintenance_requests')
            .insert([
                {
                    ...data,
                    status: 'new'
                }
            ]);

        if (error) {
            console.error('Error submitting maintenance request:', error);
            return { success: false, error: 'Erro ao enviar solicitação.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error submitting maintenance request:', error);
        return { success: false, error: 'Erro inesperado.' };
    }
}

export async function getMaintenanceRequests() {
    try {
        const { data, error } = await supabase
            .from('maintenance_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching maintenance requests:', error);
            return [];
        }

        return data as MaintenanceRequest[];
    } catch (error) {
        console.error('Unexpected error fetching maintenance requests:', error);
        return [];
    }
}

export async function updateMaintenanceStatus(id: string, status: string) {
    try {
        const { error } = await supabase
            .from('maintenance_requests')
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
