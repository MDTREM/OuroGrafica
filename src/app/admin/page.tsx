"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Users, DollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { stats, orders } = useAdmin();

    const statCards = [
        {
            label: "Vendas Totais",
            value: formatPrice(stats.totalSales),
            icon: DollarSign,
            color: "bg-orange-50 text-brand"
        },
        {
            label: "Pedidos Pendentes",
            value: stats.pendingOrders,
            icon: Package,
            color: "bg-orange-50 text-brand"
        },
        {
            label: "Produtos Ativos",
            value: stats.totalProducts,
            icon: ShoppingBag,
            color: "bg-orange-50 text-brand"
        },
        {
            label: "Clientes (Simulado)",
            value: "148", // Mock logic
            icon: Users,
            color: "bg-orange-50 text-brand"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Visão geral da sua gráfica.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Pedidos Recentes</h2>
                    <Link href="/admin/pedidos" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                        Ver todos <ArrowUpRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.slice(0, 5).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Produção' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Enviado' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-green-100 text-green-800'
                                            }
                                        `}>
                                            {order.status}
                                        </span>
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
