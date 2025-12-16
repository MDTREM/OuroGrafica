"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Printer {
    id: string;
    name: string;
    model: string;
    description: string;
    image_url: string;
    monthly_price?: number;
    available_for_rent: boolean;
    specs: {
        speed?: string;
        resolution?: string;
        connectivity?: string;
        paper_capacity?: string;
        is_color?: boolean;
        is_wifi?: boolean;
        is_scanner?: boolean;
        features?: string[];
    };
    is_active: boolean;
}

export default function AdminPrintersPage() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        model: "",
        description: "",
        image_url: "",
        monthly_price: "",
        available_for_rent: true,
        // Detailed Specs
        speed: "",
        resolution: "",
        connectivity: "",
        paper_capacity: "",
        is_color: false,
        is_wifi: false,
        is_scanner: false,
        features: "" // Comma separated for extra features
    });

    useEffect(() => {
        fetchPrinters();
    }, []);

    async function fetchPrinters() {
        try {
            const { data, error } = await supabase
                .from('rental_printers')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setPrinters(data);
        } catch (error) {
            console.error("Error fetching printers:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const specs = {
                speed: formData.speed,
                resolution: formData.resolution,
                connectivity: formData.connectivity,
                paper_capacity: formData.paper_capacity,
                is_color: formData.is_color,
                is_wifi: formData.is_wifi,
                is_scanner: formData.is_scanner,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
            };

            const payload = {
                name: formData.name,
                model: formData.model,
                description: formData.description,
                image_url: formData.image_url,
                monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
                available_for_rent: formData.available_for_rent,
                specs: specs
            };

            let error;
            if (editingId) {
                // Update
                const { error: updateError } = await supabase
                    .from('rental_printers')
                    .update(payload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('rental_printers')
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

            setIsModalOpen(false);
            resetForm();
            fetchPrinters();
            alert(editingId ? "Impressora atualizada!" : "Impressora adicionada!");

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    }

    const resetForm = () => {
        setFormData({
            name: "", model: "", description: "", image_url: "", monthly_price: "", available_for_rent: true,
            speed: "", resolution: "", connectivity: "", paper_capacity: "",
            is_color: false, is_wifi: false, is_scanner: false, features: ""
        });
        setEditingId(null);
    }

    const handleEdit = (printer: Printer) => {
        setEditingId(printer.id);
        setFormData({
            name: printer.name,
            model: printer.model,
            description: printer.description || "",
            image_url: printer.image_url || "",
            monthly_price: printer.monthly_price ? printer.monthly_price.toString() : "",
            available_for_rent: printer.available_for_rent,
            speed: printer.specs?.speed || "",
            resolution: printer.specs?.resolution || "",
            connectivity: printer.specs?.connectivity || "",
            paper_capacity: printer.specs?.paper_capacity || "",
            is_color: printer.specs?.is_color || false,
            is_wifi: printer.specs?.is_wifi || false,
            is_scanner: printer.specs?.is_scanner || false,
            features: printer.specs?.features ? printer.specs.features.join(', ') : ""
        });
        setIsModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir?")) return;

        try {
            await supabase.from('rental_printers').delete().eq('id', id);
            setPrinters(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir.");
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciar Impressoras</h1>
                    <p className="text-gray-500">Adicione ou edite os modelos disponíveis para locação.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e65a00] transition-colors"
                >
                    <Plus size={20} />
                    Nova Impressora
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <p>Carregando...</p>
            ) : printers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">Nenhuma impressora cadastrada.</p>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="text-brand font-bold hover:underline">
                        Cadastrar a primeira
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {printers.map(printer => (
                        <div key={printer.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative group">
                            <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                                {printer.image_url ? (
                                    <img src={printer.image_url} alt={printer.name} className="max-h-full object-contain mix-blend-multiply" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={48} />
                                )}
                                {!printer.available_for_rent && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Indisponível</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(printer)}
                                        className="p-1.5 bg-white text-blue-500 rounded shadow hover:bg-blue-50"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(printer.id)}
                                        className="p-1.5 bg-white text-red-500 rounded shadow hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{printer.name}</h3>
                                    {printer.monthly_price && (
                                        <span className="text-sm font-bold text-green-600">R$ {printer.monthly_price}</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{printer.model}</p>

                                <div className="flex gap-2 mb-2">
                                    {printer.specs.is_color && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">Color</span>}
                                    {printer.specs.is_wifi && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Wi-Fi</span>}
                                    {printer.specs.is_scanner && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Scan</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingId ? "Editar Impressora" : "Nova Impressora"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Identificação */}
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Informações Gerais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome (Marca)</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Epson EcoTank"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                        <input
                                            required
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="Ex: L3150"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                                        <input
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
                                        <input
                                            type="number"
                                            value={formData.monthly_price}
                                            onChange={e => setFormData({ ...formData, monthly_price: e.target.value })}
                                            placeholder="Ex: 150.00"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, available_for_rent: !formData.available_for_rent })}
                                            className={`w-full h-[38px] px-3 rounded-lg border flex items-center gap-2 text-sm font-medium transition-all ${formData.available_for_rent ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.available_for_rent ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}>
                                                {formData.available_for_rent && <CheckSquare size={10} className="text-white" />}
                                            </div>
                                            {formData.available_for_rent ? "Disponível para Aluguel" : "Indisponível"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Especificações Detalhadas */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Especificações Técnicas</h3>

                                {/* Checks */}
                                <div className="flex gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_color: !formData.is_color })}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.is_color ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        Colorida
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_wifi: !formData.is_wifi })}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.is_wifi ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        Wi-Fi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_scanner: !formData.is_scanner })}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.is_scanner ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        Scanner
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Velocidade</label>
                                        <input
                                            value={formData.speed}
                                            onChange={e => setFormData({ ...formData, speed: e.target.value })}
                                            placeholder="Ex: 38 ppm"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Resolução Máx</label>
                                        <input
                                            value={formData.resolution}
                                            onChange={e => setFormData({ ...formData, resolution: e.target.value })}
                                            placeholder="Ex: 5760 x 1440 dpi"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Conectividade</label>
                                        <input
                                            value={formData.connectivity}
                                            onChange={e => setFormData({ ...formData, connectivity: e.target.value })}
                                            placeholder="Ex: USB 2.0, Ethernet"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Papel</label>
                                        <input
                                            value={formData.paper_capacity}
                                            onChange={e => setFormData({ ...formData, paper_capacity: e.target.value })}
                                            placeholder="Ex: 100 folhas"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Outras Features (separar por vírgula)</label>
                                        <input
                                            value={formData.features}
                                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                                            placeholder="Duplex, Alimentador automático, Impressão frente e verso..."
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-brand text-white font-bold rounded-lg hover:bg-[#e65a00] transition-colors"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
