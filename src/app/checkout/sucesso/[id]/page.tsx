'use client';

import { Container } from "@/components/ui/Container";
import { CheckCircle, Copy, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Polling for status payment
    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
            if (data) setOrder(data);
            setLoading(false);
        };

        fetchOrder();

        const interval = setInterval(async () => {
            const { data } = await supabase.from('orders').select('status').eq('id', orderId).single();
            if (data && data.status === 'paid') {
                setOrder((prev: any) => ({ ...prev, status: 'paid' }));
                clearInterval(interval);
            }
        }, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, [orderId]);

    const handleCopyPix = () => {
        if (order?.qr_code) {
            navigator.clipboard.writeText(order.qr_code);
            alert("Código Pix copiado!");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand" size={40} /></div>
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center p-4 text-center">Pedido não encontrado 😢</div>
    }

    const isPaid = order.status === 'paid';

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 mb-8">
                <Container className="flex items-center justify-center">
                    <h1 className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h1>
                </Container>
            </div>

            <Container className="max-w-md mx-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">

                    {isPaid ? (
                        <div className="animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
                            <p className="text-gray-500 mb-8">Seu pedido já está sendo processado pela nossa equipe.</p>

                            <Link href="/perfil/pedidos" className="w-full bg-brand text-white font-bold py-3 px-6 rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2">
                                Ver Meus Pedidos <ArrowRight size={20} />
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Pague via Pix</h2>
                            <p className="text-sm text-gray-500 mb-6">O QR Code expira em 1 hora.</p>

                            {/* QR Code Image */}
                            {order.qr_code_image && (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 mb-6 inline-block">
                                    <img src={order.qr_code_image} alt="QR Code Pix" className="w-48 h-48 checkboard-pattern" />
                                </div>
                            )}

                            {/* Copia e Cola */}
                            <div className="mb-8 text-left">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Pix Copia e Cola</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={order.qr_code}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs text-gray-600 truncate"
                                    />
                                    <button
                                        onClick={handleCopyPix}
                                        className="bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl mb-6 flex items-center gap-3 text-left">
                                <Loader2 size={16} className="animate-spin flex-shrink-0" />
                                <p>Estamos aguardando seu pagamento. A confirmação é automática!</p>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
