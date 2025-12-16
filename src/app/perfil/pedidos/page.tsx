"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";

export default function OrdersPage() {
    // Mock Orders Data
    const orders = [
        {
            id: "#9321",
            date: "14/12/2024",
            status: "processing",
            total: 144.90,
            items: [
                { title: "Cartão de Visita Premium", quantity: 100 },
                { title: "Adesivo Vinil", quantity: 50 }
            ]
        },
        {
            id: "#8954",
            date: "02/11/2024",
            status: "delivered",
            total: 250.00,
            items: [
                { title: "Banner Roll-Up", quantity: 1 }
            ]
        },
        {
            id: "#8801",
            date: "20/10/2024",
            status: "delivered",
            total: 89.90,
            items: [
                { title: "Panfletos A5", quantity: 1000 }
            ]
        },
        {
            id: "#7522",
            date: "15/09/2024",
            status: "canceled",
            total: 45.00,
            items: [
                { title: "Cartão Fidelidade", quantity: 100 }
            ]
        }
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "processing":
                return { label: "Em Produção", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock };
            case "delivered":
                return { label: "Entregue", color: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle };
            case "canceled":
                return { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-100", icon: AlertCircle };
            case "shipped":
                return { label: "Enviado", color: "text-orange-600 bg-orange-50 border-orange-100", icon: Truck };
            default:
                return { label: status, color: "text-gray-600 bg-gray-50 border-gray-100", icon: Package };
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center gap-4">
                    <Link href="/perfil" className="text-gray-500 hover:text-brand transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-8">Meus Pedidos</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Link href={`/perfil/pedidos/${order.id.replace('#', '')}`} key={order.id} className="block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-gray-300 transition-all cursor-pointer group">
                                {/* Header: ID, Date, Status */}
                                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-3 justify-between items-center bg-gray-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-brand font-bold shadow-sm">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block text-sm">Pedido {order.id}</span>
                                            <span className="text-xs text-gray-500">{order.date}</span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </div>
                                </div>

                                {/* Body: Items & Total */}
                                <div className="p-4">
                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                                <span>{item.quantity}x {item.title}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-xs text-gray-400 italic">+ outros itens</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div>
                                            <span className="text-xs text-gray-500">Total</span>
                                            <p className="font-bold text-gray-900">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                                        </div>
                                        <button className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                                            Ver Detalhes
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-gray-900 font-bold mb-2">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500 text-sm mb-6">Você ainda não fez nenhuma compra conosco.</p>
                        <Link href="/" className="bg-brand text-white font-bold py-3 px-6 rounded-full hover:bg-brand/90 transition-colors">
                            Começar a Comprar
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
}
