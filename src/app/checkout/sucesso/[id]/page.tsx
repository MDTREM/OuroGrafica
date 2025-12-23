'use client';

import { useEffect, useState, use } from 'react';
import { Container } from '@/components/ui/Container';
import { CheckCircle, Printer, Calendar, Copy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getOrder } from '@/actions/checkout-actions';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            const data = await getOrder(resolvedParams.id);
            setOrder(data);
            setLoading(false);
        };
        loadOrder();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando detalhes do pedido...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h1>
                    <Link href="/" className="text-brand hover:underline">Voltar para a loja</Link>
                </div>
            </div>
        );
    }

    const { customer_info, address_info, items } = order;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <Container className="max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-green-600 p-8 text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Pedido Realizado com Sucesso!</h1>
                        <p className="opacity-90">Obrigado pela preferência, {customer_info.name || customer_info.companyName}.</p>
                    </div>

                    <div className="p-8">
                        {/* Order Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Número do Pedido</p>
                                <p className="text-xl font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Data do Pedido</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    {format(new Date(order.created_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="py-8 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4">Pagamento</h2>

                            {order.payment_method === 'pix' ? (
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center space-y-4">
                                    <p className="text-sm text-gray-600">Escaneie o QR Code ou copie a chave Pix abaixo:</p>
                                    <div className="w-48 h-48 bg-white border border-gray-200 mx-auto flex items-center justify-center p-2">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Ouro Grafica6008BRASILIA62070503***6304E2CA`}
                                            alt="QR Code Pix"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value="00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Ouro Grafica6008BRASILIA62070503***6304E2CA"
                                            className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs text-gray-500 font-mono"
                                        />
                                        <button className="p-2 hover:bg-gray-100 rounded border border-gray-200 transition-colors" title="Copiar">
                                            <Copy size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-orange-600 font-medium">Aguardando pagamento...</p>
                                </div>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-600" />
                                    <div>
                                        <p className="font-bold text-green-700">Pagamento Confirmado</p>
                                        <p className="text-xs text-green-600">Cartão de Crédito</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="py-8">
                            <h2 className="font-bold text-gray-900 mb-4">Itens do Pedido</h2>
                            <div className="space-y-4">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Printer size={24} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{item.quantity} unidades • {item.details?.paper}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">{formatPrice(item.price)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-brand">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Link href="/perfil/pedidos" className="flex items-center gap-2 text-brand font-bold hover:underline">
                                Ver meus pedidos <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
