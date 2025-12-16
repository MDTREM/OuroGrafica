"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle, Clock, Truck, AlertCircle, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    // Mock Order Data (In a real app, fetch based on params.id)
    const order = {
        id: params.id,
        date: "14/12/2024",
        status: "processing", // processing, delivered, canceled, shipped
        paymentMethod: "Pix",
        total: 144.90,
        subtotal: 129.90,
        shippingPrice: 15.00,
        shippingMethod: "Sedex (3 dias úteis)",
        address: {
            street: "Rua das Flores, 123",
            neighborhood: "Centro",
            city: "Belo Horizonte",
            state: "MG",
            zip: "30.123-456"
        },
        items: [
            {
                id: "1",
                title: "Cartão de Visita Premium",
                subtitle: "1000 un. / Couchê 300g / Laminação Fosca",
                price: 49.90,
                quantity: 1,
                image: "https://i.imgur.com/8Qj9Y2s.png"
            },
            {
                id: "2",
                title: "Adesivo Vinil Redondo",
                subtitle: "500 un. / 5x5cm / Recorte Eletrônico",
                price: 35.00,
                quantity: 1,
                image: "https://i.imgur.com/J8X5X1y.png" // Placeholder
            }
        ],
        timeline: [
            { date: "14/12 - 10:30", title: "Pedido Recebido", completed: true },
            { date: "14/12 - 10:35", title: "Pagamento Aprovado", completed: true },
            { date: "15/12 - 08:00", title: "Em Produção", completed: true, current: true },
            { date: "--", title: "Saiu para Entrega", completed: false },
            { date: "--", title: "Entregue", completed: false },
        ]
    };

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

    const StatusIcon = getStatusConfig(order.status).icon;
    const statusConfig = getStatusConfig(order.status);

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
                                Pedido #{order.id}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.color} flex items-center gap-1`}>
                                    <StatusIcon size={12} /> {statusConfig.label}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500">Realizado em {order.date}</p>
                        </div>
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-gray-600 border-gray-200 hover:bg-gray-50">
                            <Printer size={16} /> Imprimir Recibo
                        </Button>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-8 my-4 ml-2">
                        {order.timeline.map((step, idx) => (
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
                        {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex gap-4 border-b border-gray-50 last:border-0">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    <div className="w-full h-full bg-gray-200"></div> {/* Placeholder image if needed */}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{item.subtitle}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.quantity}un.</span>
                                        <span className="text-sm font-bold text-gray-900">R$ {item.price.toFixed(2).replace('.', ',')}</span>
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
                                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                                <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Pago</span>
                            </p>
                        </div>
                        <div className="border-t border-gray-50 pt-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <MapPin size={18} className="text-gray-400" />
                                Endereço de Entrega
                            </h3>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p>{order.address.street}</p>
                                <p>{order.address.neighborhood}</p>
                                <p>{order.address.city} - {order.address.state}</p>
                                <p>{order.address.zip}</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. RESUMO */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Resumo Financeiro</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete ({order.shippingMethod})</span>
                                <span>R$ {order.shippingPrice.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-brand font-bold text-lg pt-4 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button className="w-full bg-brand hover:bg-brand/90 text-white font-bold h-12 shadow-md">
                        Repetir Pedido
                    </Button>
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium h-12">
                        Preciso de Ajuda
                    </Button>
                </div>

            </Container>
        </div>
    );
}
