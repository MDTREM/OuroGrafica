'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { getMaintenanceRequests, MaintenanceRequest } from '@/actions/maintenance-actions';
import { getQuoteRequests, QuoteRequest } from '@/actions/quote-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from '@/components/ui/Modal';
import { Eye } from 'lucide-react';

export default function SolicitacoesPage() {
    const [activeTab, setActiveTab] = useState<'outsourcing' | 'maintenance'>('outsourcing');
    const [outsourcingRequests, setOutsourcingRequests] = useState<QuoteRequest[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedOutsourcing, setSelectedOutsourcing] = useState<QuoteRequest | null>(null);
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);

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
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {outsourcingRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
                                                        <div className="text-xs text-gray-400 font-normal">{req.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <div className="font-medium">{req.company_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">Novo</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedOutsourcing(req)}
                                                            className="text-brand hover:bg-brand/10 p-2 rounded-lg transition-colors flex items-center gap-1 ml-auto font-medium"
                                                        >
                                                            <Eye size={18} />
                                                            Ver Detalhes
                                                        </button>
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
                                            <th className="px-6 py-4">Equipamento</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
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
                                                        <div className="text-xs text-gray-400 font-normal">{req.whatsapp}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        <span className="font-medium">{req.brand}</span> {req.model}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">Novo</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedMaintenance(req)}
                                                            className="text-brand hover:bg-brand/10 p-2 rounded-lg transition-colors flex items-center gap-1 ml-auto font-medium"
                                                        >
                                                            <Eye size={18} />
                                                            Ver Detalhes
                                                        </button>
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

            {/* Outsourcing Detail Modal */}
            <Modal
                isOpen={!!selectedOutsourcing}
                onClose={() => setSelectedOutsourcing(null)}
                title="Detalhes do Orçamento (Outsourcing)"
            >
                {selectedOutsourcing && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                                <p className="text-gray-900">{format(new Date(selectedOutsourcing.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">ID</label>
                                <p className="text-gray-500 text-xs font-mono">{selectedOutsourcing.id}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-bold text-gray-900 mb-3">Informações do Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Nome Completo</label>
                                    <p className="font-medium">{selectedOutsourcing.first_name} {selectedOutsourcing.last_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Email</label>
                                    <p className="font-medium">{selectedOutsourcing.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Telefone</label>
                                    <p className="font-medium">{selectedOutsourcing.phone}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Empresa</label>
                                    <p className="font-medium">{selectedOutsourcing.company_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">CNPJ</label>
                                    <p className="font-medium">{selectedOutsourcing.cnpj}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Cargo</label>
                                    <p className="font-medium">{selectedOutsourcing.job_title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-bold text-gray-900 mb-3">Detalhes do Projeto</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Qtd. Equipamentos</label>
                                        <p className="font-medium text-lg">{selectedOutsourcing.equipment_qty}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Volume de Impressão</label>
                                        <p className="font-medium text-lg">{selectedOutsourcing.print_volume}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Área de Atuação</label>
                                    <p className="font-medium">{selectedOutsourcing.area_of_operation}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Mensagem</label>
                                    <p className="bg-gray-50 p-3 rounded-lg text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                        {selectedOutsourcing.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Maintenance Detail Modal */}
            <Modal
                isOpen={!!selectedMaintenance}
                onClose={() => setSelectedMaintenance(null)}
                title="Detalhes da Manutenção"
            >
                {selectedMaintenance && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                                <p className="text-gray-900">{format(new Date(selectedMaintenance.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">ID</label>
                                <p className="text-gray-500 text-xs font-mono">{selectedMaintenance.id}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-bold text-gray-900 mb-3">Informações do Contato</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500">Nome</label>
                                    <p className="font-medium">{selectedMaintenance.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">WhatsApp</label>
                                    <p className="font-medium">{selectedMaintenance.whatsapp}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-bold text-gray-900 mb-3">Equipamento</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Marca</label>
                                    <p className="font-medium">{selectedMaintenance.brand}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Modelo</label>
                                    <p className="font-medium">{selectedMaintenance.model || '-'}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="text-xs text-gray-500">Descrição do Problema</label>
                                <p className="bg-red-50 p-3 rounded-lg text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border border-red-100 mt-1">
                                    {selectedMaintenance.problem_description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
