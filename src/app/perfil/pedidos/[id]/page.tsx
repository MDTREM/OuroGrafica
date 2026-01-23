"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle, Clock, Truck, AlertCircle, Copy, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadOrder();
        }
    }, [user, isAuthLoading, id]);

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            // Client-side fetch to use active session (Correct for RLS)
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (data && !error) {
                // Determine timeline status based on order status
                // Status mapping: pending -> 'pending'
                // Paid -> 'paid' OR 'Produção'
                // Produced -> 'Enviado' ?

                const s = data.status;

                // Helper to check if step is completed
                const isPaid = s === 'paid' || s === 'Produção' || s === 'Enviado' || s === 'Entregue';
                const isProduction = s === 'Produção' || s === 'Enviado' || s === 'Entregue';
                const isShipped = s === 'Enviado' || s === 'Entregue';
                const isDelivered = s === 'Entregue';

                const timeline = [
                    { date: new Date(data.created_at).toLocaleString('pt-BR'), title: "Pedido Recebido", completed: true, current: false },
                    { date: isPaid ? "Confirmado" : "--", title: "Pagamento Aprovado", completed: isPaid, current: s === 'paid' },
                    { date: isProduction ? "Em andamento" : "--", title: "Em Produção", completed: isProduction, current: s === 'Produção' },
                    { date: isShipped ? "Enviado" : "--", title: "Saiu para Entrega", completed: isShipped, current: s === 'Enviado' },
                    { date: isDelivered ? "Entregue" : "--", title: "Entregue", completed: isDelivered, current: s === 'Entregue' },
                ];

                setOrder({ ...data, timeline });
            } else {
                console.error("Order not found or error:", error);
                setOrder(null);
            }
        } catch (error) {
            console.error("Error loading order", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Produção":
            case "paid":
                return { label: "Em Produção", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock };
            case "Entregue":
                return { label: "Entregue", color: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle };
            case "canceled":
            case "cancelled":
                return { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-100", icon: AlertCircle };
            case "Enviado":
            case "shipped":
                return { label: "Enviado", color: "text-orange-600 bg-orange-50 border-orange-100", icon: Truck };
            default:
                return { label: "Aguardando Pagamento", color: "text-yellow-600 bg-yellow-50 border-yellow-100", icon: Clock };
        }
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
                <Link href="/perfil/pedidos" className="text-brand hover:underline">Voltar para meus pedidos</Link>
            </div>
        );
    }

    const { address_info, items: order_items_json, total } = order;
    // Prefer items JSONB, fallback to order_items if it existed
    const items = order_items_json || order.order_items || [];

    const currentStatusConfig = getStatusConfig(order.status);
    const StatusIcon = currentStatusConfig.icon;

    // Derived values (safeguard against missing props)
    const subtotal = total; // Simplified
    const shippingPrice = 0; // Simplified
    const shippingMethod = address_info?.shipping_method === 'pickup' ? 'Retirada na Loja' : 'Entrega';
    const address = address_info || {};

    // Determine Payment Label
    let paymentLabel = "Aguardando";
    if (order.payment_method === 'pix' || order.txid) paymentLabel = "Pix";
    else if (order.payment_method === 'credit') paymentLabel = "Cartão de Crédito";

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center gap-4">
                    <Link href="/perfil/pedidos" className="text-gray-500 hover:text-brand transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-8">Detalhes do Pedido</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-3xl mx-auto space-y-6">

                {/* 1. STATUS CARD */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Pedido #{order.display_id || order.id.slice(0, 8).toUpperCase()}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${currentStatusConfig.color} flex items-center gap-1`}>
                                    <StatusIcon size={12} /> {currentStatusConfig.label}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500">Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-gray-600 border-gray-200 hover:bg-gray-50">
                            <Printer size={16} /> Imprimir Recibo
                        </Button>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-8 my-4 ml-2">
                        {order.timeline.map((step: any, idx: number) => (
                            <div key={idx} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${step.completed || step.current ? "bg-brand border-brand" : "bg-white border-gray-300"}`}></div>

                                <div className={`${step.completed || step.current ? "text-gray-900" : "text-gray-400"}`}>
                                    <h4 className={`text-sm font-bold ${step.current ? "text-brand" : ""}`}>{step.title}</h4>
                                    <p className="text-xs">{step.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. ITEMS LIST */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Package size={18} className="text-gray-400" />
                            Itens do Pedido
                        </h3>
                    </div>
                    <div>
                        {items.map((item: any, idx: number) => (
                            <div key={item.id} className="p-4 flex gap-4 border-b border-gray-50 last:border-0">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${item.image || ''})` }}>
                                    {!item.image && <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto</div>}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{item.details?.format || item.selected_format} / {item.details?.paper || item.selected_paper}</p>
                                    {item.details?.selectedVariations && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.entries(item.details.selectedVariations).map(([key, value]) => (
                                                <span key={key} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                                    {key}: {String(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.quantity}un.</span>
                                        <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3. PAGAMENTO & ENDEREÇO */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <CreditCard size={18} className="text-gray-400" />
                                Pagamento
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="font-medium text-gray-900">{paymentLabel}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${currentStatusConfig.color}`}>{currentStatusConfig.label}</span>
                            </p>
                        </div>
                        <div className="border-t border-gray-50 pt-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <MapPin size={18} className="text-gray-400" />
                                Endereço de Entrega
                            </h3>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p>{address.street}, {address.number} {address.complement}</p>
                                <p>{address.neighborhood}</p>
                                <p>{address.city} - {address.state}</p>
                                <p>{address.zip}</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. RESUMO */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Resumo Financeiro</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete ({shippingMethod})</span>
                                <span>{formatPrice(shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between text-brand font-bold text-lg pt-4 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </section>
                </div>

            </Container>
        </div>
    );
}
