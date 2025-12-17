"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAddresses, saveAddress, deleteAddress, setDefaultAddress } from "@/actions/profile-actions";
import { useRouter } from "next/navigation";

export default function AddressesPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    // State
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load Addresses
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadAddresses();
        }
    }, [user, isAuthLoading]);

    const loadAddresses = async () => {
        setIsLoading(true);
        try {
            const data = await getAddresses(user!.id);
            setAddresses(data);
        } catch (error) {
            console.error("Error loading addresses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        street: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip: ""
    });
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
            // Optimistic update
            setAddresses(addresses.filter(addr => addr.id !== id));
            await deleteAddress(user!.id, id);
            loadAddresses(); // Re-fetch to confirm sync
        }
    };

    const handleOpenModal = (address: any = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                title: address.title,
                street: address.street,
                complement: address.complement || "",
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                zip: address.zip
            });
        } else {
            setEditingAddress(null);
            setFormData({
                title: "",
                street: "",
                complement: "",
                neighborhood: "",
                city: "",
                state: "",
                zip: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const addressData = {
                id: editingAddress?.id,
                ...formData,
                is_default: addresses.length === 0 // If first address, make default
            };

            const result = await saveAddress(user.id, addressData);

            if (result.success) {
                await loadAddresses();
                setIsModalOpen(false);
            } else {
                alert("Erro ao salvar endereço.");
            }
        } catch (error) {
            alert("Erro inesperado.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        // Optimistic update
        setAddresses(addresses.map(addr => ({
            ...addr,
            is_default: addr.id === id
        })));

        await setDefaultAddress(user!.id, id);
        loadAddresses();
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            setIsLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                        zip: cep.replace(/(\d{5})(\d{3})/, '$1-$2')
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            } finally {
                setIsLoadingCep(false);
            }
        }
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 relative">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center gap-4">
                    <Link href="/perfil" className="text-gray-500 hover:text-brand transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-8">Meus Endereços</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-2xl mx-auto">
                {/* List */}
                <div className="space-y-4 mb-8">
                    {addresses.map((addr) => (
                        <div key={addr.id} className={`bg-white rounded-xl border p-5 relative group ${addr.is_default ? 'border-brand shadow-sm ring-1 ring-brand/10' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-gray-400" />
                                    <h3 className="font-bold text-gray-900">{addr.title}</h3>
                                    {addr.is_default && (
                                        <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-wide">Padrão</span>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 pl-6 leading-relaxed">
                                <p>{addr.street}, {addr.complement}</p>
                                <p>{addr.neighborhood}</p>
                                <p>{addr.city} - {addr.state}</p>
                                <p className="text-gray-400 mt-1">{addr.zip}</p>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenModal(addr)}
                                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                {!addr.is_default && (
                                    <>
                                        <button
                                            onClick={() => handleSetDefault(addr.id)}
                                            className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors mr-auto"
                                        >
                                            <Star size={14} /> Tornar Padrão
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(addr.id)}
                                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={14} /> Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            Nenhum endereço cadastrado.
                        </div>
                    )}
                </div>

                {/* Add New Button */}
                <Button
                    onClick={() => handleOpenModal()}
                    className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-brand hover:text-brand hover:bg-orange-50 font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-none"
                >
                    <Plus size={20} />
                    Adicionar Novo Endereço
                </Button>
            </Container>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">
                            {editingAddress ? "Editar Endereço" : "Novo Endereço"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Local</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Minha Casa"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">CEP</label>
                                    <input
                                        type="text"
                                        placeholder="00000-000"
                                        value={formData.zip}
                                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                        onBlur={handleCepBlur}
                                        maxLength={9}
                                        className={`w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm ${isLoadingCep ? 'bg-gray-50' : ''}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Estado (UF)</label>
                                    <input
                                        type="text"
                                        placeholder="MG"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Cidade</label>
                                <input
                                    type="text"
                                    placeholder="Nome da Cidade"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Logradouro</label>
                                <input
                                    type="text"
                                    placeholder="Rua, Avenida..."
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
                                    <input
                                        type="text"
                                        placeholder="Bairro"
                                        value={formData.neighborhood}
                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Complemento</label>
                                    <input
                                        type="text"
                                        placeholder="Apto, Sala..."
                                        value={formData.complement}
                                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-gray-200 text-gray-700">
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-brand text-white hover:bg-brand/90 font-bold flex items-center justify-center gap-2">
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
