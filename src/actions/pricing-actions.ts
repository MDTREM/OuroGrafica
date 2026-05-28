'use server';

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to create authenticated client from token passed by the frontend
function createAuthClient(token: string) {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}

export interface PricingItem {
    id: string;
    product_id?: string;
    product_name: string;
    quantity: number;
    type?: string;
    material?: string;
    finish?: string;
    extras?: string;
    cost: number;
    markup: number;
    base_price: number; // Competitor average price
    card_fee_percentage: number;
    shipping_cost: number;
    created_at?: string;
}

export async function getPricingItems(token?: string): Promise<{ success: boolean; data?: PricingItem[]; error?: string }> {
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
            .from('pricing_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error fetching pricing items:", error.message);
            throw new Error(error.message);
        }

        return { success: true, data: data as PricingItem[] };
    } catch (err: any) {
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}

export async function savePricingItem(item: Partial<PricingItem>, token?: string): Promise<{ success: boolean; data?: PricingItem; error?: string }> {
    try {
        if (!token) {
            return { success: false, error: "Usuário não autenticado. Token ausente." };
        }

        const supabase = createAuthClient(token);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Sessão inválida ou expirada." };
        }

        const isUpdate = !!item.id;
        const payload = {
            product_id: item.product_id || null,
            product_name: item.product_name || "Sem Nome",
            quantity: Number(item.quantity) || 1,
            type: item.type || "",
            material: item.material || "",
            finish: item.finish || "",
            extras: item.extras || "",
            cost: Number(item.cost) || 0,
            markup: Number(item.markup) || 1,
            base_price: Number(item.base_price) || 0,
            card_fee_percentage: Number(item.card_fee_percentage) !== undefined ? Number(item.card_fee_percentage) : 3.49,
            shipping_cost: Number(item.shipping_cost) !== undefined ? Number(item.shipping_cost) : 25.00
        };

        if (isUpdate) {
            const { data, error } = await supabase
                .from('pricing_items')
                .update(payload)
                .eq('id', item.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as PricingItem };
        } else {
            const { data, error } = await supabase
                .from('pricing_items')
                .insert([{ ...payload, id: item.id || crypto.randomUUID() }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as PricingItem };
        }
    } catch (err: any) {
        console.error("Supabase error saving pricing item:", err.message);
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}

export async function deletePricingItem(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
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
            .from('pricing_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error("Supabase error deleting pricing item:", err.message);
        return { success: false, error: err.message || "Erro desconhecido" };
    }
}
