'use server';

import { supabase } from "@/lib/supabase";

export async function searchOrder(orderId: string, verificationInput: string) {
    if (!orderId || !verificationInput) {
        return { success: false, error: "Preencha todos os campos." };
    }

    try {
        // 1. Fetch order
        // Strategy: Try by display_id (Exact) -> Then by ID (Exact) -> Then by ID (Partial/Prefix for legacy 8-char)

        let order = null;
        const inputUpper = orderId.toUpperCase().trim();
        const inputRaw = orderId.trim();

        // A. Try display_id (Exact match, Case Insensitive usually, but we store Upper)
        const { data: byDisplay } = await supabase
            .from('orders')
            .select('*')
            .eq('display_id', inputUpper)
            .single();

        if (byDisplay) {
            order = byDisplay;
        } else {
            // B. Try UUID match (Exact or Prefix)
            // If input is long (UUID-like), try exact. If short (8 chars), try prefix.
            // Note: Postgres UUID must be valid UUID string for .eq('id', ...), otherwise it fails.
            // Text search on UUID column using 'ilike' requires casting id::text, 
            // but supabase filter "not.eq" etc might not auto-cast.
            // Safest: use helper or just 'ilike' on a text representation if possible, OR:
            // For now, if length is 36, try exact ID. 
            // If length is 8, we can't easily do "id starts with" efficiently without a function or knowing it's a UUID.
            // However, legacy logic was users typing 8 chars.
            // Let's try to match the first 8 chars of the ID if we can.
            // "filter('id::text', 'ilike', `${inputRaw}%`)" works if Supabase allows casting in filter.
            // A simpler approach for now:

            if (inputRaw.length > 20) {
                const { data: byId } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', inputRaw)
                    .single();
                order = byId;
            } else if (inputRaw.length >= 8) {
                // Try to find one where ID starts with this (Legacy behavior fallback)
                // We use .like because .eq won't match partial
                const { data: byPartial } = await supabase
                    .from('orders')
                    .select('*')
                    .ilike('id', `${inputRaw}%`) // This requires casting implicitly or explicit support
                    .limit(1)
                    .maybeSingle(); // Use maybeSingle to avoid 406 if multiple (unlikely with 8 chars)

                order = byPartial;
            }
        }

        if (!order) {
            return { success: false, error: "Pedido não encontrado." };
        }

        // 2. Validate Verification Input (Email or CPF against stored data)
        // Stored data is in flat columns (customer_email, customer_document)
        // OR in customer_info json (legacy/fallback)

        const storedEmail = order.customer_email || order.customer_info?.email || "";
        const storedCpf = order.customer_document || order.customer_info?.cpf || "";

        const inputClean = verificationInput.toLowerCase().trim();
        const storedEmailClean = storedEmail.toLowerCase().trim();
        const storedCpfClean = storedCpf.replace(/\D/g, "");
        const inputCpfClean = verificationInput.replace(/\D/g, "");

        let isValid = false;

        // Check Email
        if (storedEmailClean && inputClean === storedEmailClean) {
            isValid = true;
        }
        // Check CPF (only if input looks like a CPF, i.e., has numbers)
        else if (storedCpfClean && inputCpfClean === storedCpfClean && inputCpfClean.length > 5) {
            isValid = true;
        }

        if (!isValid) {
            return { success: false, error: "Dados de verificação incorretos para este pedido." };
        }

        // 3. Return Order Data (Sanitized if needed, but here we return full for display)
        return { success: true, order: order };

    } catch (error) {
        console.error("Search Order Error:", error);
        return { success: false, error: "Erro ao buscar pedido." };
    }
}
