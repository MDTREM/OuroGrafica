"use client";

import React, { useState, useEffect } from "react";
import { 
    getBrandingSubmissions, 
    updateSubmissionStatus, 
    deleteSubmission, 
    BrandingSubmission 
} from "@/actions/branding-actions";
import { useAuth } from "@/contexts/AuthContext";
import { 
    Search, 
    Trash2, 
    CheckCircle, 
    Clock, 
    Phone, 
    Eye, 
    Filter, 
    TrendingUp, 
    AlertCircle, 
    Calendar, 
    Building2, 
    Tag,
    X,
    User,
    Mail,
    FileText,
    MessageSquare,
    ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminBrandingPage() {
    const { session } = useAuth();
    const [submissions, setSubmissions] = useState<BrandingSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<BrandingSubmission | null>(null);

    // Filters States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");

    useEffect(() => {
        if (session?.access_token) {
            loadSubmissions();
        }
    }, [session]);

    const loadSubmissions = async () => {
        setLoading(true);
        const token = session?.access_token;
        const result = await getBrandingSubmissions(token);
        if (result.success && result.data) {
            setSubmissions(result.data);
        } else {
            console.error("Failed to load submissions:", result.error);
        }
        setLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: "pending" | "contacted" | "completed") => {
        const token = session?.access_token;
        const result = await updateSubmissionStatus(id, newStatus, token);
        if (result.success) {
            setSubmissions(prev => 
                prev.map(sub => sub.id === id ? { ...sub, status: newStatus, updated_at: new Date().toISOString() } : sub)
            );
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } else {
            alert(`Erro ao atualizar status: ${result.error}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta solicitação permanentemente?")) return;

        const token = session?.access_token;
        const result = await deleteSubmission(id, token);
        if (result.success) {
            setSubmissions(prev => prev.filter(sub => sub.id !== id));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(null);
            }
        } else {
            alert(`Erro ao excluir: ${result.error}`);
        }
    };

    // Filter logic
    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = 
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.whatsapp.includes(searchQuery) ||
            sub.niche.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        const matchesPlan = planFilter === "all" || sub.selected_plan === planFilter;

        return matchesSearch && matchesStatus && matchesPlan;
    });

    // Stats calculations
    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === "pending").length,
        contacted: submissions.filter(s => s.status === "contacted").length,
        completed: submissions.filter(s => s.status === "completed").length
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        <Clock size={12} />
                        Pendente
                    </span>
                );
            case "contacted":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <Phone size={12} />
                        Contatado
                    </span>
                );
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Finalizado
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Solicitações de Branding</h1>
                    <p className="text-gray-500">Acompanhe as propostas e leads de identidades visuais.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadSubmissions} className="self-start">
                    Atualizar Lista
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total de Leads</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-gray-900">{stats.total}</h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">100%</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Aguardando Contato</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-yellow-600">{stats.pending}</h3>
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md font-semibold">
                            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Em Negociação</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-blue-600">{stats.contacted}</h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                            {stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0}%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Negócios Fechados</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-semibold text-green-600">{stats.completed}</h3>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-semibold">
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, loja, nicho..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Filter size={16} />
                            Filtros:
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Apenas Pendentes</option>
                            <option value="contacted">Apenas Contatados</option>
                            <option value="completed">Apenas Finalizados</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            <option value="all">Todos os Planos</option>
                            <option value="Basic Taste">Basic Taste</option>
                            <option value="Combo Perfeito">Combo Perfeito</option>
                            <option value="Banquete Viral">Banquete Viral</option>
                            <option value="Vink Club">Vink Club</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions Table / Cards */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand mx-auto mb-4"></div>
                        Carregando registros de formulários...
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <AlertCircle className="mx-auto mb-3 text-gray-300" size={40} />
                        <p className="text-lg font-medium text-gray-900">Nenhum registro encontrado</p>
                        <p className="text-sm">Não há formulários preenchidos correspondentes aos filtros.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Loja / Cliente</th>
                                    <th className="px-6 py-4">Plano</th>
                                    <th className="px-6 py-4">Nicho</th>
                                    <th className="px-6 py-4">Contato</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                            {new Date(sub.created_at).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-950">{sub.store_name}</div>
                                            <div className="text-xs text-gray-500">{sub.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{sub.selected_plan || "Não informado"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                                {sub.niche}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900">{sub.whatsapp}</div>
                                            <div className="text-xs text-gray-400">{sub.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {getStatusBadge(sub.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                                                    title="Visualizar Completo"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                
                                                <a
                                                    href={`https://wa.me/55${sub.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                                                        `Olá ${sub.name}! Aqui é a equipe da Vink. Recebemos seu formulário de interesse no plano *${sub.selected_plan}* para a *${sub.store_name}*. Gostaria de conversar mais sobre sua marca? 🚀`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        if (sub.status === "pending") {
                                                            handleStatusChange(sub.id, "contacted");
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Chamar no WhatsApp"
                                                >
                                                    <Phone size={18} />
                                                </a>

                                                <button
                                                    onClick={() => handleDelete(sub.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Excluir Registro"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Detail Modal Drawer */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Ficha Técnica de Solicitação</h3>
                                <p className="text-xs text-gray-400 mt-1">ID: {selectedSubmission.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 flex-1">
                            {/* Visual Identity Section Status */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 block uppercase">Status Atual</span>
                                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(selectedSubmission.id, "pending")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            selectedSubmission.status === "pending"
                                                ? "bg-yellow-500 text-white border-yellow-500"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        Pendente
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(selectedSubmission.id, "contacted")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            selectedSubmission.status === "contacted"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        Contatado
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(selectedSubmission.id, "completed")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            selectedSubmission.status === "completed"
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        Finalizado
                                    </button>
                                </div>
                            </div>

                            {/* Client & Shop info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
                                        Informações da Empresa
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <Building2 className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Loja / Restaurante</span>
                                                <p className="text-sm font-semibold text-gray-900">{selectedSubmission.store_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <FileText className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">CNPJ</span>
                                                <p className="text-sm text-gray-700">{selectedSubmission.cnpj || "Não cadastrado"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <Tag className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Nicho de Negócio</span>
                                                <p className="text-sm text-gray-700">{selectedSubmission.niche}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
                                        Informações do Solicitante
                                    </h4>

                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <User className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Responsável</span>
                                                <p className="text-sm font-semibold text-gray-900">{selectedSubmission.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <Phone className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">WhatsApp</span>
                                                <p className="text-sm font-semibold text-brand-dark flex items-center gap-1.5">
                                                    {selectedSubmission.whatsapp}
                                                    <a 
                                                        href={`https://wa.me/55${selectedSubmission.whatsapp.replace(/\D/g, "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full"
                                                    >
                                                        Abrir chat
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <Mail className="text-gray-400 mt-0.5" size={16} />
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">E-mail</span>
                                                <p className="text-sm text-gray-700">{selectedSubmission.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Plan & business metrics */}
                            <div className="border-t border-gray-150 pt-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-brand mb-4">
                                    Objetivos & Métricas
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Plano Solicitado</span>
                                        <span className="text-sm font-semibold text-gray-900 block mt-1">
                                            {selectedSubmission.selected_plan || "Não informado"}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Pedidos Diários</span>
                                        <span className="text-sm font-semibold text-gray-900 block mt-1">
                                            {selectedSubmission.orders_per_day}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">Faturamento Mensal</span>
                                        <span className="text-sm font-semibold text-gray-900 block mt-1 capitalize">
                                            {selectedSubmission.monthly_revenue}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Details Description */}
                            {selectedSubmission.brand_details && (
                                <div className="border-t border-gray-150 pt-6 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        Sobre a marca
                                    </h4>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 text-sm text-gray-700 font-light leading-relaxed whitespace-pre-wrap">
                                        {selectedSubmission.brand_details}
                                    </div>
                                </div>
                            )}

                            {/* Audit Dates */}
                            <div className="border-t border-gray-100 pt-4 flex justify-between text-[10px] text-gray-400 font-light">
                                <div>Cadastrado em: {new Date(selectedSubmission.created_at).toLocaleString("pt-BR")}</div>
                                <div>Última atualização: {new Date(selectedSubmission.updated_at).toLocaleString("pt-BR")}</div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-between gap-4 sticky bottom-0 bg-white z-10">
                            <button
                                onClick={() => handleDelete(selectedSubmission.id)}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                                Excluir Lead
                            </button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedSubmission(null)}
                                >
                                    Fechar Ficha
                                </Button>
                                <a
                                    href={`https://wa.me/55${selectedSubmission.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                                        `Olá ${selectedSubmission.name}! Aqui é a equipe da Vink. Recebemos seu formulário de interesse no plano *${selectedSubmission.selected_plan}* para a *${selectedSubmission.store_name}*. Gostaria de conversar mais sobre sua marca? 🚀`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                        if (selectedSubmission.status === "pending") {
                                            handleStatusChange(selectedSubmission.id, "contacted");
                                        }
                                    }}
                                    className="bg-brand text-white hover:bg-[#10a379] rounded-xl px-5 py-2.5 text-sm font-semibold transition-all inline-flex items-center gap-1.5"
                                >
                                    Chamar no WhatsApp <Phone size={14} fill="currentColor" className="stroke-none" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
