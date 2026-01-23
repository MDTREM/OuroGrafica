'use server';

import { supabase } from "@/lib/supabase";

export async function searchOrder(orderId: string, verificationInput: string) {
    if (!orderId || !verificationInput) {
        return { success: false, error: "Preencha todos os campos." };
    }

    try {
        // 1. Fetch order by ID
        // fetching needed columns
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !order) {
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
