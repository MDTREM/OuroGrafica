'use server'

import { createClient } from "@supabase/supabase-js";
import { efiService } from "@/lib/efi";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface CheckoutData {
    userId: string | undefined;
    items: any[];
    total: number;
    customer: {
        name: string;
        cpf: string;
        email: string;
    };
}

export async function createPixOrder(data: CheckoutData) {
    try {
        console.log("🚀 Iniciando criação de pedido PIX...", data.customer.name);

        // 1. Validar Total (Básico)
        if (data.total <= 0) throw new Error("Valor total inválido");

        // 2. Chamar Efí para gerar cobrança
        // Converter total para string formato "10.00"
        const totalString = data.total.toFixed(2);

        // Gera a cobrança (TxId)
        const charge = await efiService.createPixCharge(
            data.customer.cpf,
            data.customer.name,
            totalString
        );

        if (!charge.loc || !charge.loc.id) {
            throw new Error("Falha ao receber ID da cobrança da Efí");
        }

        // 3. Gerar QR Code
        const qrCodeData = await efiService.getQrCode(charge.loc.id);

        // 4. Salvar Pedido no Supabase
        const { data: order, error } = await supabase
            .from("orders")
            .insert({
                user_id: data.userId || null, // Pode ser null se for convidado (futuro)
                items: data.items,
                total: data.total,
                status: "pending",

                customer_name: data.customer.name,
                customer_document: data.customer.cpf,
                customer_email: data.customer.email,

                txid: charge.txid,
                qr_code: qrCodeData.qrcode, // Copia e Cola
                qr_code_image: qrCodeData.imagemQrcode, // Base64 Img
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Erro ao salvar pedido no banco:", error);
            throw new Error("Erro ao salvar pedido");
        }

        return { success: true, order };
    } catch (error: any) {
        console.error("❌ Erro no Checkout:", error.message);
        return { success: false, error: error.message };
    }
}
