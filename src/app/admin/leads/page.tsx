"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { 
    getCRMLeads, 
    saveCRMLead, 
    deleteCRMLead, 
    CRMLead 
} from "@/actions/crm-actions";
import { 
    Users, 
    Search, 
    Plus, 
    Trash2, 
    Edit, 
    UserCheck, 
    Clock, 
    AlertTriangle, 
    Check, 
    X, 
    Eye, 
    ExternalLink, 
    FileText, 
    Phone, 
    Mail, 
    MapPin, 
    TrendingUp, 
    Copy 
} from "lucide-react";
import Link from "next/link";

export default function CRMLeadsPage() {
    const { orders, products } = useAdmin();
    const { session } = useAuth();
    const token = session?.access_token;

    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    
    // Notification & Database Migration state
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [dbError, setDbError] = useState<boolean>(false);
    const [copiedSql, setCopiedSql] = useState<boolean>(false);

    // Modal & Slide-over States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
    const [editingLead, setEditingLead] = useState<Partial<CRMLead> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const sqlCode = `-- Executar no SQL Editor do Supabase:
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    whatsapp TEXT,
    email TEXT,
    segment TEXT,
    cpf_cnpj TEXT,
    address TEXT,
    observations TEXT,
    status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'cliente', 'recorrente', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone_can_select_leads" ON public.crm_leads FOR SELECT USING (true);
CREATE POLICY "authenticated_can_insert_leads" ON public.crm_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_can_update_leads" ON public.crm_leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_can_delete_leads" ON public.crm_leads FOR DELETE TO authenticated USING (true);`;

    // Load Leads
    useEffect(() => {
        const loadLeads = async () => {
            if (!token) return;
            setIsLoading(true);
            const res = await getCRMLeads(token);
            
            if (res.success && res.data) {
                setLeads(res.data);
                setDbError(false);
                localStorage.setItem('@Vink:crm_leads', JSON.stringify(res.data));
            } else if (res.error && (res.error.includes("relation") || res.error.includes("does not exist"))) {
                setDbError(true);
                loadFromLocal();
            } else {
                loadFromLocal();
            }
            setIsLoading(false);
        };

        const loadFromLocal = () => {
            const localData = localStorage.getItem('@Vink:crm_leads');
            if (localData) {
                try {
                    setLeads(JSON.parse(localData));
                } catch (e) {
                    console.error("Local CRM error:", e);
                }
            } else {
                // Populate default samples
                const defaultLeads: CRMLead[] = [
                    {
                        id: 'lead-1',
                        name: 'Clara Mendes',
                        company: 'Pastisserie Clara',
                        whatsapp: '(31) 98888-7777',
                        email: 'clara@pastisserie.com',
                        segment: 'Alimentício / Doces',
                        cpf_cnpj: '12.345.678/0001-99',
                        address: 'Rua das Flores, 123 - Centro, Belo Horizonte/MG',
                        observations: 'Interessada em renovar os cardápios de mesa e caixas unboxing.',
                        status: 'cliente'
                    },
                    {
                        id: 'lead-2',
                        name: 'Lucas Rocha',
                        company: 'Cafés Especiais L.R.',
                        whatsapp: '(31) 97777-6666',
                        email: 'lucas@cafeslr.com.br',
                        segment: 'Alimentício / Café',
                        cpf_cnpj: '98.765.432-10',
                        address: 'Av. do Contorno, 4500 - Savassi, Belo Horizonte/MG',
                        observations: 'Compra adesivos e banners com alta frequência. Cliente vip.',
                        status: 'recorrente'
                    }
                ];
                setLeads(defaultLeads);
                localStorage.setItem('@Vink:crm_leads', JSON.stringify(defaultLeads));
            }
        };

        if (token) {
            loadLeads();
        } else {
            loadFromLocal();
            setIsLoading(false);
        }
    }, [token]);

    const triggerNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const copySql = () => {
        navigator.clipboard.writeText(sqlCode);
        setCopiedSql(true);
        triggerNotification('success', 'Código SQL copiado para a área de transferência!');
        setTimeout(() => setCopiedSql(false), 2000);
    };

    // Calculate Dynamic E-commerce Metrics for a Lead
    const getLeadMetrics = (lead: CRMLead) => {
        // Match orders by email, name, or cpf/cnpj
        const matchingOrders = orders.filter(o => 
            (lead.email && o.customer_info?.email?.toLowerCase() === lead.email.toLowerCase()) ||
            (lead.name && o.customerName?.toLowerCase() === lead.name.toLowerCase()) ||
            (lead.cpf_cnpj && o.customer_info?.cpf?.replace(/\D/g, '') === lead.cpf_cnpj.replace(/\D/g, ''))
        );

        let totalSpent = 0;
        let totalQty = 0;
        const boughtProductNames = new Set<string>();
        const boughtProductLinks: { title: string; link: string }[] = [];

        matchingOrders.forEach(o => {
            totalSpent += o.total;
            if (o.items && Array.isArray(o.items)) {
                o.items.forEach(item => {
                    totalQty += item.quantity || 1;
                    if (item.title) {
                        boughtProductNames.add(item.title);
                        // Find if this product has a supplier link
                        const prod = products.find(p => p.title.toLowerCase() === item.title.toLowerCase());
                        if (prod?.supplierLink) {
                            boughtProductLinks.push({ title: item.title, link: prod.supplierLink });
                        }
                    }
                });
            }
        });

        // Determine recurrence level
        let recurrence: 'Nenhuma' | 'Média' | 'Alta' = 'Nenhuma';
        if (matchingOrders.length > 3) {
            recurrence = 'Alta';
        } else if (matchingOrders.length > 0) {
            recurrence = 'Média';
        }

        return {
            matchingOrders,
            totalSpent,
            totalQty,
            uniqueProductsCount: boughtProductNames.size,
            productsList: Array.from(boughtProductNames).join(', ') || 'Nenhum',
            boughtProductLinks: Array.from(new Map(boughtProductLinks.map(l => [l.link, l])).values()), // unique links
            recurrence
        };
    };

    // CRUD Actions
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead || !editingLead.name) return;

        setIsSaving(true);
        const payload = {
            ...editingLead,
            status: editingLead.status || 'lead'
        };

        const updatedLeads = [...leads];
        const index = updatedLeads.findIndex(l => l.id === payload.id);

        if (index >= 0) {
            updatedLeads[index] = payload as CRMLead;
        } else {
            payload.id = payload.id || 'lead-' + Date.now();
            updatedLeads.unshift(payload as CRMLead);
        }

        setLeads(updatedLeads);
        localStorage.setItem('@Vink:crm_leads', JSON.stringify(updatedLeads));

        try {
            const res = await saveCRMLead(payload, token);
            if (res.success && res.data) {
                setLeads(prev => prev.map(l => l.id === payload.id ? res.data! : l));
                triggerNotification('success', 'Lead salvo e sincronizado com o banco!');
            } else {
                triggerNotification('success', 'Salvo localmente (modo offline)');
            }
        } catch (err) {
            triggerNotification('success', 'Salvo localmente (offline)');
        }

        setIsSaving(false);
        setIsFormOpen(false);
        setEditingLead(null);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Deseja realmente excluir este lead?')) return;

        const updatedLeads = leads.filter(l => l.id !== id);
        setLeads(updatedLeads);
        localStorage.setItem('@Vink:crm_leads', JSON.stringify(updatedLeads));

        if (selectedLead?.id === id) {
            setSelectedLead(null);
        }

        try {
            const res = await deleteCRMLead(id, token);
            if (res.success) {
                triggerNotification('success', 'Lead excluído com sucesso!');
            }
        } catch (e) {
            triggerNotification('success', 'Lead removido localmente');
        }
    };

    const openAddModal = () => {
        setEditingLead({
            id: '',
            name: '',
            company: '',
            whatsapp: '',
            email: '',
            segment: '',
            cpf_cnpj: '',
            address: '',
            observations: '',
            status: 'lead'
        });
        setIsFormOpen(true);
    };

    const openEditModal = (lead: CRMLead, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingLead({ ...lead });
        setIsFormOpen(true);
    };

    // Filter Leads
    const filteredLeads = leads.filter(lead => {
        const matchesQuery = 
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (lead.segment && lead.segment.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesQuery && matchesStatus;
    });

    // Metrics Card Stats
    const totalLeads = leads.length;
    const clientCount = leads.filter(l => l.status === 'cliente').length;
    const recurringCount = leads.filter(l => l.status === 'recorrente').length;
    const inactiveCount = leads.filter(l => l.status === 'inativo').length;

    return (
        <Container className="py-8 space-y-8 max-w-7xl mx-auto selection:bg-brand selection:text-white font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-brand shrink-0" size={28} /> CRM & Leads
                    </h1>
                    <p className="text-xs text-gray-500 font-light mt-1">Gerencie leads, converta-os em clientes e veja o histórico de faturamento integrado.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold px-4 py-2.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand/10 hover:shadow-lg text-xs"
                >
                    <Plus size={16} /> Adicionar Lead
                </button>
            </div>

            {/* Notification alert */}
            {notification && (
                <div className={`fixed bottom-6 right-6 p-4 rounded-xl border shadow-xl flex items-center gap-2.5 z-50 animate-in slide-in-from-bottom-5 duration-350 ${
                    notification.type === 'success' ? 'bg-white border-green-100 text-green-700 shadow-green-150/10' : 'bg-white border-red-100 text-red-600 shadow-red-150/10'
                }`}>
                    <Check size={18} className="shrink-0" />
                    <span className="text-xs font-semibold">{notification.message}</span>
                </div>
            )}

            {/* Supabase migration alert */}
            {dbError && (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start shadow-sm animate-in fade-in duration-300">
                    <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={24} />
                    <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-orange-800 text-sm">Integração do Banco pendente (Supabase)</h3>
                        <p className="text-xs text-orange-700 font-light leading-relaxed">
                            A tabela `crm_leads` não foi encontrada no seu Supabase. O CRM está funcionando em **modo de contingência seguro (localStorage)**. Para habilitar a gravação na nuvem, basta copiar o código SQL abaixo e executá-lo no SQL Editor do seu console Supabase.
                        </p>
                        <div className="relative bg-gray-900 rounded-xl p-4 mt-3 max-h-40 overflow-y-auto custom-scrollbar font-mono text-[10px] text-gray-300">
                            <button
                                onClick={copySql}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Copiar SQL"
                            >
                                <Copy size={14} className={copiedSql ? "text-brand" : "text-white"} />
                            </button>
                            <pre className="whitespace-pre">{sqlCode}</pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Total de Leads</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 leading-none">{totalLeads}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Clientes</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 leading-none">{clientCount}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Recorrentes</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 leading-none">{recurringCount}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Inativos</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 leading-none">{inactiveCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, empresa, e-mail ou segmento..."
                        className="pl-9 w-full rounded-xl border border-gray-200 text-xs focus:border-brand focus:ring-1 focus:ring-brand h-9 px-3"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 select-none">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtrar:</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="h-9 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 focus:outline-none focus:border-brand"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="lead">Lead (Negociação)</option>
                        <option value="cliente">Cliente (Ativo)</option>
                        <option value="recorrente">Recorrente (Frequente)</option>
                        <option value="inativo">Inativo</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-800 font-bold border-b border-gray-100 select-none">
                                <th className="px-5 py-4 min-w-[200px]">Nome / Empresa</th>
                                <th className="px-5 py-4 min-w-[150px]">Contato</th>
                                <th className="px-5 py-4 min-w-[120px]">Segmento</th>
                                <th className="px-5 py-4 min-w-[120px]">CNPJ/CPF</th>
                                <th className="px-5 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-right">Comprados</th>
                                <th className="px-5 py-4 text-center">Recorrência</th>
                                <th className="px-5 py-4 text-center w-24">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-gray-500 font-medium">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand border-r-2 mx-auto mb-3"></div>
                                        Carregando clientes e leads...
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-gray-400 font-medium">
                                        Nenhum lead ou cliente encontrado. Crie um novo no botão superior.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const metrics = getLeadMetrics(lead);
                                    
                                    // Status Badge Colors
                                    const statusColors: Record<string, string> = {
                                        lead: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                        cliente: 'bg-blue-50 text-blue-700 border-blue-100',
                                        recorrente: 'bg-green-50 text-green-700 border-green-100',
                                        inativo: 'bg-gray-50 text-gray-500 border-gray-250'
                                    };

                                    return (
                                        <tr 
                                            key={lead.id} 
                                            onClick={() => setSelectedLead(lead)}
                                            className="hover:bg-gray-50/40 transition-colors cursor-pointer group"
                                        >
                                            {/* Name & Company */}
                                            <td className="px-5 py-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-brand transition-colors text-sm">{lead.name}</p>
                                                    {lead.company && <p className="text-xs text-gray-400 font-light mt-0.5">{lead.company}</p>}
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-5 py-3 text-gray-500 font-light">
                                                <div className="space-y-0.5">
                                                    {lead.whatsapp && <p className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /> {lead.whatsapp}</p>}
                                                    {lead.email && <p className="flex items-center gap-1 text-[11px]"><Mail size={11} className="text-gray-400" /> {lead.email}</p>}
                                                </div>
                                            </td>

                                            {/* Segment */}
                                            <td className="px-5 py-3 text-gray-700 font-medium">{lead.segment || <span className="text-gray-300 italic font-light">Nenhum</span>}</td>

                                            {/* CNPJ / CPF */}
                                            <td className="px-5 py-3 text-gray-500 font-mono">{lead.cpf_cnpj || <span className="text-gray-300 italic font-light font-sans">Nenhum</span>}</td>

                                            {/* Status */}
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${statusColors[lead.status]}`}>
                                                    {lead.status === 'lead' ? 'Lead' : lead.status === 'cliente' ? 'Cliente' : lead.status === 'recorrente' ? 'Recorrente' : 'Inativo'}
                                                </span>
                                            </td>

                                            {/* Products bought count */}
                                            <td className="px-5 py-3 text-right">
                                                <div>
                                                    <span className="font-bold text-gray-800">{metrics.totalQty}</span>
                                                    <span className="text-[10px] text-gray-400 font-light block">em {metrics.matchingOrders.length} pedido(s)</span>
                                                </div>
                                            </td>

                                            {/* Recurrence status */}
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-[11px] font-semibold ${
                                                    metrics.recurrence === 'Alta' ? 'text-green-600' : metrics.recurrence === 'Média' ? 'text-blue-500' : 'text-gray-400'
                                                }`}>
                                                    {metrics.recurrence}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={(e) => openEditModal(lead, e)}
                                                        className="text-gray-400 hover:text-brand p-1.5 rounded-lg hover:bg-brand/5 transition-all"
                                                        title="Editar Lead"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(lead.id, e)}
                                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                                        title="Excluir Lead"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Detail Slide-Over Sidebar (Premium Modal) */}
            {selectedLead && (
                <div className="fixed inset-0 z-40 bg-black/30 flex justify-end animate-in fade-in duration-300">
                    <div 
                        onClick={() => setSelectedLead(null)} 
                        className="absolute inset-0 z-0 cursor-pointer" 
                    />
                    
                    {/* Sliding Panel */}
                    <div className="w-full max-w-lg bg-white h-full relative z-10 shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        {/* Panel Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedLead.name}</h2>
                                {selectedLead.company && <p className="text-sm text-gray-400 font-light mt-0.5">{selectedLead.company}</p>}
                                <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase mt-2 ${
                                    selectedLead.status === 'lead' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                    selectedLead.status === 'cliente' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    selectedLead.status === 'recorrente' ? 'bg-green-50 text-green-700 border-green-100' :
                                    'bg-gray-50 text-gray-500 border-gray-250'
                                }`}>
                                    {selectedLead.status}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedLead(null)} 
                                className="p-1.5 hover:bg-gray-50 border border-gray-150 rounded-xl transition-all"
                            >
                                <X size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        {/* Metrics Panel */}
                        {(() => {
                            const m = getLeadMetrics(selectedLead);
                            return (
                                <div className="space-y-6">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none">Total Faturado</p>
                                            <p className="text-base font-bold text-brand mt-1 leading-none">{formatPrice(m.totalSpent)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none">Pedidos Concluídos</p>
                                            <p className="text-base font-bold text-gray-800 mt-1 leading-none">{m.matchingOrders.length}</p>
                                        </div>
                                    </div>

                                    {/* Profile Details Block */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">Informações de Cadastro</h3>
                                        <div className="space-y-3 text-xs leading-normal">
                                            {selectedLead.whatsapp && (
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <Phone size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <span><strong>WhatsApp:</strong> {selectedLead.whatsapp}</span>
                                                </div>
                                            )}
                                            {selectedLead.email && (
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <span><strong>E-mail:</strong> {selectedLead.email}</span>
                                                </div>
                                            )}
                                            {selectedLead.segment && (
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <span><strong>Segmento Comercial:</strong> {selectedLead.segment}</span>
                                                </div>
                                            )}
                                            {selectedLead.cpf_cnpj && (
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <span><strong>CNPJ/CPF:</strong> {selectedLead.cpf_cnpj}</span>
                                                </div>
                                            )}
                                            {selectedLead.address && (
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <span><strong>Endereço:</strong> {selectedLead.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Observations */}
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">Notas do Administrador</h3>
                                        <div className="bg-yellow-50/50 rounded-xl p-3.5 border border-yellow-100 text-xs text-gray-700 leading-relaxed font-light italic">
                                            {selectedLead.observations || "Nenhuma observação ou anotação para este cliente."}
                                        </div>
                                    </div>

                                    {/* Shortcuts to Supplier links of purchased products */}
                                    {m.boughtProductLinks.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">Atalhos de Recompra no Fornecedor</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {m.boughtProductLinks.map((item, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-2.5 bg-brand/5 border border-brand/10 hover:border-brand/35 rounded-xl text-xs text-brand hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                                                    >
                                                        <span>Comprar {item.title}</span>
                                                        <ExternalLink size={14} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order History Timeline */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">Histórico de Pedidos E-commerce</h3>
                                        
                                        <div className="space-y-3">
                                            {m.matchingOrders.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">Nenhum pedido de e-commerce associado a este e-mail/documento ainda.</p>
                                            ) : (
                                                m.matchingOrders.map(order => (
                                                    <div 
                                                        key={order.id} 
                                                        className="bg-white border border-gray-150 rounded-2xl p-4 space-y-3 hover:shadow-xs transition-shadow relative"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">Pedido #{order.id.slice(0, 8)}</p>
                                                                <p className="text-[11px] text-gray-500 font-light mt-1">{new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.payment_method}</p>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                                order.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700' :
                                                                order.status === 'Produção' ? 'bg-orange-50 text-orange-700' :
                                                                order.status === 'Enviado' ? 'bg-blue-50 text-blue-700' :
                                                                'bg-green-50 text-green-700'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>

                                                        {/* Items inside this order */}
                                                        <ul className="divide-y divide-gray-50 text-xs pl-2 border-l-2 border-brand/20 space-y-1.5 pt-1">
                                                            {order.items && order.items.map((item, idx) => (
                                                                <li key={idx} className="pt-1.5 first:pt-0">
                                                                    <div className="flex justify-between text-gray-800 font-semibold leading-none">
                                                                        <span>{item.quantity}x {item.title}</span>
                                                                        <span>{formatPrice(item.price)}</span>
                                                                    </div>
                                                                    {item.details && (
                                                                        <p className="text-[10px] text-gray-400 font-light mt-0.5">
                                                                            {[item.details.format, item.details.finish, item.details.paper].filter(Boolean).join(' | ')}
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-50">
                                                            <span className="text-gray-400 font-light">Total Faturado:</span>
                                                            <span className="font-bold text-brand">{formatPrice(order.total)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Add & Edit Modal Form */}
            {isFormOpen && editingLead && (
                <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-5 animate-in zoom-in-95 duration-250 border border-gray-100 shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingLead.id ? 'Editar Lead / Cliente' : 'Adicionar Novo Lead'}
                            </h3>
                            <button 
                                onClick={() => setIsFormOpen(false)} 
                                className="p-1 hover:bg-gray-50 rounded-xl"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-left">
                            {/* Nome */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nome do Contato</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                    value={editingLead.name || ''}
                                    onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                                    placeholder="Ex: Clara Mendes"
                                />
                            </div>

                            {/* Empresa & Segmento */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Empresa</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                        value={editingLead.company || ''}
                                        onChange={e => setEditingLead({ ...editingLead, company: e.target.value })}
                                        placeholder="Ex: Pastisserie Clara"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Segmento</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                        value={editingLead.segment || ''}
                                        onChange={e => setEditingLead({ ...editingLead, segment: e.target.value })}
                                        placeholder="Ex: Doces / Confeitaria"
                                    />
                                </div>
                            </div>

                            {/* WhatsApp & Email */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                        value={editingLead.whatsapp || ''}
                                        onChange={e => setEditingLead({ ...editingLead, whatsapp: e.target.value })}
                                        placeholder="(31) 99999-9999"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">E-mail</label>
                                    <input
                                        type="email"
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                        value={editingLead.email || ''}
                                        onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {/* CNPJ / CPF & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CNPJ / CPF</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                        value={editingLead.cpf_cnpj || ''}
                                        onChange={e => setEditingLead({ ...editingLead, cpf_cnpj: e.target.value })}
                                        placeholder="00.000.000/0001-00"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</label>
                                    <select
                                        value={editingLead.status || 'lead'}
                                        onChange={e => setEditingLead({ ...editingLead, status: e.target.value as any })}
                                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                    >
                                        <option value="lead">Lead</option>
                                        <option value="cliente">Cliente Activo</option>
                                        <option value="recorrente">Recorrente</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Endereço Completo</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand"
                                    value={editingLead.address || ''}
                                    onChange={e => setEditingLead({ ...editingLead, address: e.target.value })}
                                    placeholder="Rua, Número, Bairro, Cidade/UF"
                                />
                            </div>

                            {/* Observações */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Observações internas</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-brand resize-none font-light"
                                    value={editingLead.observations || ''}
                                    onChange={e => setEditingLead({ ...editingLead, observations: e.target.value })}
                                    placeholder="Notas internas sobre propostas, preferências, histórico ou orçamentos enviados..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-xs font-semibold"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Container>
    );
}
