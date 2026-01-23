'use client';

import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { Search, Loader2, Package, CheckCircle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils"; // Assuming utils exists

export default function TrackingPage() {
    const [orderId, setOrderId] = useState("");
    const [verification, setVerification] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const { searchOrder } = await import('@/actions/tracking-actions');
            const res = await searchOrder(orderId.trim(), verification.trim());

            if (res.success) {
                setOrder(res.order);
            } else {
                setError(res.error || "Pedido não encontrado.");
            }
        } catch (err) {
            setError("Erro ao buscar pedido. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    // Helper for status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
            case 'Produção':
                return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Package size={14} /> Em Produção</span>;
            case 'Enviado':
                return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Package size={14} /> Enviado</span>;
            case 'Entregue':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><CheckCircle size={14} /> Entregue</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Clock size={14} /> Aguardando Pagamento</span>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <Container className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Rastrear Pedido</h1>
                    <p className="text-gray-500">Acompanhe o status do seu pedido em tempo real.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Número do Pedido (ID)</label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Ex: 550e8400..."
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">CPF ou E-mail (usado na compra)</label>
                            <input
                                type="text"
                                value={verification}
                                onChange={(e) => setVerification(e.target.value)}
                                placeholder="Digite seu CPF ou E-mail para confirmar"
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> Rastrear Agora</>}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium animate-in fade-in">
                            {error}
                        </div>
                    )}
                </div>

                {/* Result */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Pedido</p>
                                <h2 className="text-lg font-bold">#{order.id.slice(0, 8)}...</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Data</p>
                                <p className="font-bold">{formatDate(order.created_at)}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Status */}
                            <div className="flex justify-center mb-8">
                                <div className="scale-125">
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">Entrega</h3>
                                    {order.address_info ? (
                                        <div className="text-sm text-gray-600">
                                            <p>{order.address_info.street}, {order.address_info.number}</p>
                                            <p>{order.address_info.district} - {order.address_info.city}/{order.address_info.state}</p>
                                            <p>{order.address_info.zip}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Retirada na Loja</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">Cliente</h3>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-bold text-gray-900">{order.customer_name || order.customer_info?.name}</p>
                                        <p>{order.customer_email || order.customer_info?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
                                <div className="space-y-4">
                                    {Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.title}</p>
                                                    <p className="text-gray-500">{item.quantity} un.</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {formatPrice ? formatPrice(item.price * item.quantity) : `R$ ${item.price}`}
                                            </span>
                                        </div>
                                    )) : (
                                        // Legacy JSON handling if needed, but array check handles it
                                        <p className="text-sm text-gray-500">Detalhes dos itens indisponíveis.</p>
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-lg">Total</span>
                                <span className="font-bold text-brand text-2xl">
                                    {formatPrice ? formatPrice(order.total) : `R$ ${order.total}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
