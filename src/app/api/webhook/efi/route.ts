import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("🔔 Webhook Efí Recebido:", JSON.stringify(body, null, 2));

        // A Efí manda um array de eventos no campo "pix"
        // Ex: { pix: [ { txid: "...", status: "CONCLUIDA" } ] }

        if (body.pix && Array.isArray(body.pix)) {
            for (const pix of body.pix) {
                if (pix.txid && pix.status === "CONCLUIDA") {
                    console.log(`✅ Pagamento Confirmado: ${pix.txid}`);

                    const { error } = await supabase
                        .from("orders")
                        .update({ status: "paid", updated_at: new Date().toISOString() })
                        .eq("txid", pix.txid);

                    if (error) console.error("❌ Erro ao atualizar pedido:", error);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Erro no Webhook:", error.message);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
