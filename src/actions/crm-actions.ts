'use server';

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createAuthClient(token: string) {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}

export interface CRMLead {
    id: string;
    name: string;
    company?: string;
    whatsapp?: string;
    email?: string;
    segment?: string;
    cpf_cnpj?: string;
    address?: string;
    observations?: string;
    status: 'lead' | 'cliente' | 'recorrente' | 'inativo';
    created_at?: string;
}

export async function getCRMLeads(token?: string): Promise<{ success: boolean; data?: CRMLead[]; error?: string }> {
    try {
        if (!token) {
            return { success: false, error: "Usuário não autenticado. Token ausente." };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Sessão inválida ou expirada." };
        }

        const { data, error } = await supabase
            .from('crm_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error fetching leads:", error.message);
            throw new Error(error.message);
        }

        return { success: true, data: data as CRMLead[] };
    } catch (err: any) {
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}

export async function saveCRMLead(lead: Partial<CRMLead>, token?: string): Promise<{ success: boolean; data?: CRMLead; error?: string }> {
    try {
        if (!token) {
            return { success: false, error: "Usuário não autenticado. Token ausente." };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Sessão inválida ou expirada." };
        }

        const isUpdate = !!lead.id;
        const payload = {
            name: lead.name || "Sem Nome",
            company: lead.company || "",
            whatsapp: lead.whatsapp || "",
            email: lead.email || "",
            segment: lead.segment || "",
            cpf_cnpj: lead.cpf_cnpj || "",
            address: lead.address || "",
            observations: lead.observations || "",
            status: lead.status || 'lead'
        };

        if (isUpdate) {
            const { data, error } = await supabase
                .from('crm_leads')
                .update(payload)
                .eq('id', lead.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as CRMLead };
        } else {
            const { data, error } = await supabase
                .from('crm_leads')
                .insert([{ ...payload, id: lead.id || crypto.randomUUID() }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as CRMLead };
        }
    } catch (err: any) {
        console.error("Supabase error saving lead:", err.message);
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}

export async function deleteCRMLead(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!token) {
            return { success: false, error: "Usuário não autenticado. Token ausente." };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Sessão inválida ou expirada." };
        }

        const { error } = await supabase
            .from('crm_leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error("Supabase error deleting lead:", err.message);
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}
