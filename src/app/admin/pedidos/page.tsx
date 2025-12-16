"use client";

import { useAdmin, Order } from "@/contexts/AdminContext";
import { formatPrice } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export default function AdminOrdersPage() {
    const { orders, updateOrderStatus } = useAdmin();
    const [query, setQuery] = useState("");

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.customerName.toLowerCase().includes(query.toLowerCase())
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
                                    <td className="px-6 py-4">{order.items} itens</td>
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
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-brand transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
