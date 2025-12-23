'use server';

import { supabase } from '@/lib/supabase';

export interface OrderInput {
    customer_info: any;
    address_info: any;
    payment_method: string;
    total: number;
    items: any[];
    userId?: string;
}

export async function createOrder(data: OrderInput) {
    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_info: data.customer_info,
                address_info: data.address_info,
                payment_method: data.payment_method,
                total: data.total,
                status: 'pending_payment',
                user_id: data.userId || null
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return { success: false, error: orderError.message || 'Erro ao criar pedido.' };
        }

        // 2. Create Items
        const itemsToInsert = data.items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            details: item.details || {}
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // In a real app, we might want to rollback the order here
            return { success: false, error: 'Erro ao salvar itens do pedido.' };
        }

        return { success: true, orderId: order.id };

    } catch (error) {
        console.error('Unexpected error creating order:', error);
        return { success: false, error: 'Erro inesperado.' };
    }
}

export async function getOrder(id: string) {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error) {
            return null;
        }

        return order;
    } catch (error) {
        return null;
    }
}
