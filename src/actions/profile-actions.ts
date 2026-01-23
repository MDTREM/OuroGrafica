'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// --- PROFILE ---

export async function getProfile(userId: string) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    } catch (error) {
        return null;
    }
}

export async function updateProfile(userId: string, data: any) {
    try {
        // Upsert because profile might not exist if lazy created
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...data });

        if (error) throw error;
        revalidatePath('/perfil/dados');
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Erro ao salvar perfil.' };
    }
}

// --- ADDRESSES ---

export async function getAddresses(userId: string) {
    try {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data || [];
    } catch (error) {
        return [];
    }
}

export async function saveAddress(userId: string, address: any) {
    try {
        const { id, ...data } = address;

        // If setting as default, unset others first
        if (data.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', userId);
        }

        if (id) {
            // Update
            const { error } = await supabase
                .from('addresses')
                .update(data)
                .eq('id', id)
                .eq('user_id', userId); // Security check
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabase
                .from('addresses')
                .insert([{ ...data, user_id: userId }]);
            if (error) throw error;
        }

        revalidatePath('/perfil/enderecos');
        return { success: true };
    } catch (error) {
        console.error('Error saving address:', error);
        return { success: false, error: 'Erro ao salvar endereço.' };
    }
}

export async function deleteAddress(userId: string, addressId: string) {
    try {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', addressId)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath('/perfil/enderecos');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir endereço.' };
    }
}

export async function setDefaultAddress(userId: string, addressId: string) {
    try {
        // 1. Unset all
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);

        // 2. Set new default
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', addressId)
            .eq('user_id', userId);

        if (error) throw error;
        revalidatePath('/perfil/enderecos');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao definir padrão.' };
    }
}

// --- ORDERS ---

export async function getUserOrders(userId: string) {
    try {
        // Fetch orders - items are in the 'items' column (JSONB)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        // Return as is
        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching orders:', error);
        return [];
    }
}

export async function getOrderById(orderId: string) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) return null;
        return data;
    } catch (error) {
        return null;
    }
}
