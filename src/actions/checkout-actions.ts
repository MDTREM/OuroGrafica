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
        phone: string;
    };
    address: {
        zip: string;
        street: string;
        number: string;
        complement: string;
        district: string;
        city: string;
        state: string;
        shippingMethod?: string; // 'pickup' or 'delivery'
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
                user_id: data.userId || null,
                items: data.items,
                total: data.total,
                status: "pending",
                payment_method: "pix",

                customer_name: data.customer.name,
                customer_document: data.customer.cpf,
                customer_email: data.customer.email,
                customer_phone: data.customer.phone,

                address_info: data.address, // Saving full address object

                txid: charge.txid,
                qr_code: qrCodeData.qrcode, // Copia e Cola
                qr_code_image: qrCodeData.imagemQrcode, // Base64 Img

                // Generated Short ID (8 chars)
                display_id: Math.random().toString(36).substring(2, 10).toUpperCase(),
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


export async function checkPaymentStatus(orderId: string) {
    try {
        // 1. Buscar pedido para pegar o txid
        const { data: order, error } = await supabase
            .from("orders")
            .select("txid, status")
            .eq("id", orderId)
            .single();

        if (error || !order || !order.txid) {
            return { success: false, status: order?.status || 'unknown' };
        }

        if (order.status === 'paid' || order.status === 'Produção') {
            return { success: true, status: 'paid' };
        }

        // 2. Consultar na Efí via Server-Side (com certificado)
        const pixData = await efiService.getPixStatus(order.txid);

        // Status na Efí: ATIVA, CONCLUIDA, REMOVIDA_PELO_USUARIO_RECEBEDOR, REMOVIDA_PELO_PSP
        if (pixData.status === 'CONCLUIDA') {
            // 3. Atualizar no Banco
            await supabase
                .from("orders")
                .update({ status: 'Produção' }) // Paid = Produção for us
                .eq("id", orderId);

            return { success: true, status: 'paid' };
        }

        return { success: true, status: 'pending' };

    } catch (error) {
        console.error("Check Status Error:", error);
        return { success: false };
    }
}

export async function createCreditCardOrder(data: CheckoutData & { paymentToken: string, installments: number, billingAddress: any, cardHolder: any }) {
    try {
        console.log("🚀 Iniciando criação de pedido CARTÃO...", data.customer.name);

        if (data.total <= 0) throw new Error("Valor total inválido");
        if (!data.paymentToken) throw new Error("Token de pagamento não fornecido");

        // 1. Processar Pagamento na Efí
        // Convert to integer logic if needed, but SDK handles float usually? No, Efí expects string/number usually?
        // Our service method expects number for total? No, looking at efi.ts, we used `total: number` in type but logged it.
        // Wait, `createCreditCardCharge` payload structure in `efi.ts` uses `items` with amount/value.

        // Map items for Efí
        // Efí expects: items: [{ name, value (int cents), amount (int) }]
        const efiItems = data.items.map(item => ({
            name: item.title,
            value: Math.round(item.price * 100), // in cents
            amount: item.quantity
        }));

        // Calculate total in cents for validation ?? Action uses total passed.

        const chargeResult = await efiService.createCreditCardCharge({
            items: efiItems,
            customer: {
                name: data.customer.name,
                cpf: data.customer.cpf,
                email: data.customer.email,
                phone: data.customer.phone,
                birth: "2000-01-01" // TODO: Add birth date to form if strictly required
            },
            billingAddress: data.billingAddress,
            paymentToken: data.paymentToken,
            installments: data.installments,
            total: data.total
        });

        if (!chargeResult.success || chargeResult.status !== 'approved' && chargeResult.status !== 'waiting' && chargeResult.status !== 'paid') {
            throw new Error("Pagamento não aprovado. Verifique os dados do cartão.");
        }

        // 2. Salvar Pedido
        const { data: order, error } = await supabase
            .from("orders")
            .insert({
                user_id: data.userId || null,
                items: data.items,
                total: data.total,
                status: chargeResult.status === 'approved' || chargeResult.status === 'paid' ? 'paid' : 'pending_payment',
                payment_method: 'credit',

                customer_name: data.customer.name,
                customer_document: data.customer.cpf,
                customer_email: data.customer.email,
                customer_phone: data.customer.phone,

                address_info: data.address,

                txid: String(chargeResult.charge_id),
                // display_id created by db default? No, we generated it in code for Pix loop. Doing same here.
                display_id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Erro ao salvar pedido (Cartão) no banco:", error);
            // Charge was made but DB failed. Major issue. Log critical.
            throw new Error("Erro ao registrar pedido, mas o pagamento pode ter sido processado. Entre em contato.");
        }

        return { success: true, order };

    } catch (error: any) {
        console.error("❌ Erro no Checkout Cartão:", error.message);
        return { success: false, error: error.message };
    }
}
