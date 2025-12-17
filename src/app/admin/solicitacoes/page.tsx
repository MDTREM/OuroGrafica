'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { getMaintenanceRequests, MaintenanceRequest } from '@/actions/maintenance-actions';
import { getQuoteRequests, QuoteRequest } from '@/actions/quote-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SolicitacoesPage() {
    const [activeTab, setActiveTab] = useState<'outsourcing' | 'maintenance'>('outsourcing');
    const [outsourcingRequests, setOutsourcingRequests] = useState<QuoteRequest[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [outsourcing, maintenance] = await Promise.all([
                getQuoteRequests(),
                getMaintenanceRequests()
            ]);
            setOutsourcingRequests(outsourcing);
            setMaintenanceRequests(maintenance);
            setLoading(false);
        };
        loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Solicitações e Orçamentos</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('outsourcing')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors ${activeTab === 'outsourcing'
                            ? 'border-b-2 border-brand text-brand'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Outsourcing (Impressoras)
                </button>
                <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors ${activeTab === 'maintenance'
                            ? 'border-b-2 border-brand text-brand'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Manutenção
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-12 text-center text-gray-500">Carregando solicitações...</div>
            ) : (
                <>
                    {activeTab === 'outsourcing' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Empresa</th>
                                            <th className="px-6 py-4">Contato</th>
                                            <th className="px-6 py-4">Detalhes</th>
                                            <th className="px-6 py-4">Mensagem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {outsourcingRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    Nenhuma solicitação encontrada.
                                                </td>
                                            </tr>
                                        ) : (
                                            outsourcingRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {format(new Date(req.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {req.first_name} {req.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <div className="font-medium">{req.company_name}</div>
                                                        <div className="text-xs text-gray-400">{req.cnpj}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <div>{req.phone}</div>
                                                        <div className="text-xs text-gray-400">{req.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <div className="flex gap-2">
                                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{req.equipment_qty} un.</span>
                                                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">{req.print_volume}/mês</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">{req.area_of_operation}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={req.message}>
                                                        {req.message}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Nome</th>
                                            <th className="px-6 py-4">WhatsApp</th>
                                            <th className="px-6 py-4">Equipamento</th>
                                            <th className="px-6 py-4">Problema</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {maintenanceRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Nenhuma solicitação encontrada.
                                                </td>
                                            </tr>
                                        ) : (
                                            maintenanceRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {format(new Date(req.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {req.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {req.whatsapp}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">{req.brand}</span>
                                                        {req.model && <span className="ml-2 text-gray-500">{req.model}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 max-w-md truncate" title={req.problem_description}>
                                                        {req.problem_description}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
