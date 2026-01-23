"use client";

import { Container } from "@/components/ui/Container";
import { CheckCircle, Copy, Home, Loader2, Package, ShoppingBag, Truck, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // Correct import for client components

interface OrderDetails {
    id: string;
    display_id: string;
    status: string;
    total: number;
    payment_method: string;
    qr_code?: string;
    qr_code_image?: string;
    created_at: string;
}

export default function SuccessPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setOrder(data);
            }
            setLoading(false);
        };

        fetchOrder();

        // Polling logic
        const interval = setInterval(async () => {
            // Only poll if pending
            try {
                // Dynamically import to avoid server-action-in-client-bundle issues if any
                const { checkPaymentStatus } = await import('@/actions/checkout-actions');
                const res = await checkPaymentStatus(id);

                if (res && res.status === 'paid') {
                    setOrder((prev) => prev ? ({ ...prev, status: 'paid' }) : null);
                    // Don't clear interval immediately to allow UI to settle, or do?
                    // Ideally stop polling if paid.
                    if (res.status === 'paid') clearInterval(interval);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 5000);

        return () => clearInterval(interval);

    }, [id, supabase]);

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        // Could add toast here
        alert("Código Pix copiado!");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand" size={48} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido não encontrado</h1>
                <p className="text-gray-500 mb-6">Não conseguimos localizar os detalhes deste pedido.</p>
                <Link href="/" className="text-brand font-bold hover:underline">Voltar para a Loja</Link>
            </div>
        );
    }

    const isPaid = order.status === 'paid' || order.status === 'Produção' || order.status === 'Enviado' || order.status === 'Entregue';

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            {/* Simple Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center justify-between">
                    <Link href="/" className="text-gray-500 hover:text-brand transition-colors">
                        <Home size={24} />
                    </Link>
                    <div className="text-sm font-bold text-gray-900">Pedido #{order.display_id || order.id.slice(0, 8)}</div>
                    <div className="w-6"></div> {/* Spacer */}
                </Container>
            </div>

            <Container className="pt-8 max-w-2xl mx-auto px-4">

                {/* Main Status Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center mb-6 relative overflow-hidden">
                    {isPaid ? (
                        <div className="animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
                                <CheckCircle size={48} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Pagamento Confirmado!</h1>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">Recebemos seu pagamento e seu pedido já foi enviado para a produção.</p>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-orange-50">
                                <div className="text-2xl font-bold">Pix</div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Aguardando Pagamento</h1>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Utilize o QR Code abaixo para finalizar sua compra. A confirmação é automática.</p>

                            {order.payment_method === 'pix' && order.qr_code && (
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 inline-block w-full max-w-sm">
                                    {order.qr_code_image && (
                                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4 inline-block">
                                            <img src={order.qr_code_image} alt="QR Code Pix" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                                        </div>
                                    )}

                                    <div className="w-full text-left">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider pl-1">Pix Copia e Cola</label>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={order.qr_code}
                                                className="flex-1 bg-white border border-gray-200 text-gray-600 text-sm p-3 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all truncate"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(order.qr_code!)}
                                                className="bg-brand hover:bg-brand/90 text-white p-3 rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95 flex-shrink-0"
                                                title="Copiar Código"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Verificando pagamento...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Package size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Resumo do Pedido</h3>
                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR').slice(0, 5)}</p>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-between items-center text-sm py-2 border-t border-gray-50">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-gray-900 text-lg">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Truck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Entrega</h3>
                                <p className="text-xs text-gray-500">Acompanhe pelo painel</p>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Você receberá atualizações sobre o status da entrega no seu e-mail e painel de pedidos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <Link
                        href="/perfil/pedidos"
                        className="w-full bg-gray-900 text-white font-bold h-14 rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
                    >
                        <ShoppingBag size={20} />
                        Acompanhar Meus Pedidos
                    </Link>
                    <Link
                        href="/"
                        className="w-full bg-white text-gray-700 font-bold h-14 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        Voltar para a Loja
                    </Link>
                </div>

            </Container>
        </div>
    );
}
