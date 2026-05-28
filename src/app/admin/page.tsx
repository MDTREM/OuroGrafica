"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { formatPrice } from "@/lib/utils";
import { 
    Package, 
    ShoppingBag, 
    Users, 
    DollarSign, 
    ArrowUpRight, 
    Calculator, 
    Percent, 
    TrendingDown, 
    TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPricingItems, PricingItem } from "@/actions/pricing-actions";

export default function AdminDashboard() {
    const { stats, orders } = useAdmin();
    const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);

    useEffect(() => {
        const fetchPricing = async () => {
            const res = await getPricingItems();
            if (res.success && res.data && res.data.length > 0) {
                setPricingItems(res.data);
                localStorage.setItem('@Vink:pricing_items', JSON.stringify(res.data));
            } else {
                const localData = localStorage.getItem('@Vink:pricing_items');
                if (localData) {
                    try {
                        setPricingItems(JSON.parse(localData));
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        };
        fetchPricing();
    }, []);

    // Calculate metrics
    const totalPriced = pricingItems.length;

    const averageMarkup = totalPriced > 0
        ? pricingItems.reduce((acc, item) => acc + (Number(item.markup) || 0), 0) / totalPriced
        : 0;

    const { averageProfit, averageProfitMargin, totalPotentialRevenue, totalPotentialProfit } = (() => {
        if (totalPriced === 0) {
            return { averageProfit: 0, averageProfitMargin: 0, totalPotentialRevenue: 0, totalPotentialProfit: 0 };
        }

        let totalRev = 0;
        let totalProf = 0;

        pricingItems.forEach(item => {
            const salePrice = ((item.cost * item.markup) + item.shipping_cost) / (1 - (item.card_fee_percentage / 100));
            const fee = salePrice * (item.card_fee_percentage / 100);
            const profit = salePrice - item.cost - item.shipping_cost - fee;

            totalRev += salePrice;
            totalProf += profit;
        });

        return {
            averageProfit: totalProf / totalPriced,
            averageProfitMargin: totalRev > 0 ? (totalProf / totalRev) * 100 : 0,
            totalPotentialRevenue: totalRev,
            totalPotentialProfit: totalProf
        };
    })();

    const competitorGap = (() => {
        const withBasePrice = pricingItems.filter(item => item.base_price > 0);
        if (withBasePrice.length === 0) return 0;

        const totalDiff = withBasePrice.reduce((acc, item) => {
            const salePrice = ((item.cost * item.markup) + item.shipping_cost) / (1 - (item.card_fee_percentage / 100));
            const diff = ((salePrice - item.base_price) / item.base_price) * 100;
            return acc + diff;
        }, 0);

        return totalDiff / withBasePrice.length;
    })();

    const statCards = [
        {
            label: "Vendas Totais",
            value: formatPrice(stats.totalSales),
            icon: DollarSign,
            color: "bg-orange-50 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark"
        },
        {
            label: "Pedidos Pendentes",
            value: stats.pendingOrders,
            icon: Package,
            color: "bg-orange-50 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark"
        },
        {
            label: "Produtos Ativos",
            value: stats.totalProducts,
            icon: ShoppingBag,
            color: "bg-orange-50 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark"
        },
        {
            label: "Clientes (Ativos)",
            value: stats.totalCustomers,
            icon: Users,
            color: "bg-orange-50 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Visão geral da sua gráfica.</p>
                </div>
                <Link
                    href="/admin/precificacao"
                    className="inline-flex items-center gap-2 bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/10 self-start"
                >
                    <Calculator size={14} /> Planilha de Precificação
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                            <h3 className="text-2xl font-semibold text-gray-900">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Sincronização Precificação Grid */}
            {totalPriced > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-brand/10 p-2 rounded-xl text-brand">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Saúde Financeira da Precificação (Sincronizado)</h2>
                                <p className="text-xs text-gray-500">Métricas comerciais consolidadas baseadas na planilha.</p>
                            </div>
                        </div>
                        <Link 
                            href="/admin/precificacao" 
                            className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 hover:underline"
                        >
                            Ajustar Planilha <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Markup Card */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Markup Médio</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">{averageMarkup.toFixed(2)}x</span>
                                <span className="text-[10px] text-brand bg-brand/10 font-bold px-1.5 py-0.5 rounded-full">Sólido</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-1.5">Multiplicador médio sobre o custo</span>
                        </div>

                        {/* Lucratividade Card */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Margem de Lucro Média</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-green-700">{averageProfitMargin.toFixed(1)}%</span>
                                <span className="text-[10px] text-green-700 bg-green-100 font-bold px-1.5 py-0.5 rounded-full">Excelente</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-1.5">Lucro médio líquido por venda</span>
                        </div>

                        {/* Competitor Gap Card */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Preço vs Concorrentes</span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold ${competitorGap <= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                                    {competitorGap <= 0 ? '-' : '+'}{Math.abs(competitorGap).toFixed(1)}%
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    competitorGap <= 0 ? 'text-green-700 bg-green-100' : 'text-orange-700 bg-orange-100'
                                }`}>
                                    {competitorGap <= 0 ? 'Mais Barato' : 'Mais Caro'}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-1.5">Média em relação ao mercado</span>
                        </div>

                        {/* Lucro Potencial Card */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 block mb-1">Lucro Potencial Acumulado</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">{formatPrice(totalPotentialProfit)}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-1.5">Sobre {totalPriced} produtos precificados</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                    <Link href="/admin/pedidos" className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:underline flex items-center gap-1">
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
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.display_id || order.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Produção' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Enviado' ? 'bg-sky-100 text-sky-800' :
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
