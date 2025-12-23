"use client";

import { useAdmin, Order } from "@/contexts/AdminContext";
import { formatPrice } from "@/lib/utils";
import { Search, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export default function AdminOrdersPage() {
    const { orders, updateOrderStatus, deleteOrder } = useAdmin();
    const [query, setQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(query.toLowerCase())
    );

    const STATUS_OPTIONS: Order["status"][] = ["Pendente", "Produção", "Enviado", "Entregue"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
                <p className="text-gray-500">Gerencie e atualize o status dos pedidos.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <Input
                    placeholder="Buscar por ID ou Nome..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    icon={<Search size={18} />}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Itens</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    {/* Handle items as array or number for compatibility */}
                                    <td className="px-6 py-4">{Array.isArray(order.items) ? order.items.length : order.items} itens</td>
                                    <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                                            className={`
                                                text-xs font-medium rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-brand cursor-pointer
                                                ${order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'Produção' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'Enviado' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-green-100 text-green-800'
                                                }
                                            `}
                                        >
                                            {STATUS_OPTIONS.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-gray-400 hover:text-brand transition-colors"
                                            title="Ver Detalhes"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.")) {
                                                    await deleteOrder(order.id);
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Excluir Pedido"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pedido #{selectedOrder.id}</h2>
                                <p className="text-sm text-gray-500">Realizado em {selectedOrder.date}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* 1. Customer & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Dados do Cliente</h3>
                                    {selectedOrder.customer_info ? (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong className="text-gray-900">Nome:</strong> {selectedOrder.customer_info.name}</p>
                                            <p><strong className="text-gray-900">Email:</strong> {selectedOrder.customer_info.email}</p>
                                            <p><strong className="text-gray-900">Telefone:</strong> {selectedOrder.customer_info.phone}</p>
                                            <p><strong className="text-gray-900">CPF:</strong> {selectedOrder.customer_info.cpf || "-"}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Dados do cliente não disponíveis.</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Endereço de Entrega</h3>
                                    {selectedOrder.address_info ? (
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>{selectedOrder.address_info.street}, {selectedOrder.address_info.number}</p>
                                            <p>{selectedOrder.address_info.complement}</p>
                                            <p>{selectedOrder.address_info.district} - {selectedOrder.address_info.city}/{selectedOrder.address_info.state}</p>
                                            <p>CEP: {selectedOrder.address_info.zip}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Endereço não informado.</p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Items List */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
                                <div className="space-y-4">
                                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 border border-gray-100 rounded-xl p-4 items-start">
                                            {/* Image */}
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem foto</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    <span className="font-bold text-brand">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{item.quantity} unidades • {formatPrice(item.price)} un.</p>

                                                {/* Variations */}
                                                {item.details && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {item.details.dimensions && (
                                                            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                                                Dimensões: {item.details.dimensions.width}x{item.details.dimensions.height} cm
                                                            </span>
                                                        )}
                                                        {item.details.format && <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">Formato: {item.details.format}</span>}
                                                        {item.details.paper && <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">Papel: {item.details.paper}</span>}
                                                        {item.details.finish && <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">Acab: {item.details.finish}</span>}
                                                    </div>
                                                )}

                                                {/* Artwork Status */}
                                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                                    {item.designOption === 'upload' ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Arte Enviada</span>
                                                            {item.uploadedFile && (
                                                                <a href={item.uploadedFile} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                                    Baixar Arquivo
                                                                </a>
                                                            )}
                                                        </div>

                                                    ) : item.designOption === 'hire' ? (
                                                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Solicitou Criação (+ Designer)</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Sem opção de arte selecionada</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Footer / Total */}
                            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl">
                                <div className="text-sm text-gray-500">
                                    Status Atual: <strong className="text-gray-900">{selectedOrder.status}</strong>
                                </div>
                                <div className="text-xl">
                                    Total: <strong className="text-brand">{formatPrice(selectedOrder.total)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
