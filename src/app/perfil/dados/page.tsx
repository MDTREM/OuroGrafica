"use client";

import { Container } from "@/components/ui/Container";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/actions/profile-actions";
import { useRouter } from "next/navigation";

export default function UserDataPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        companyName: "",
        ie: ""
    });

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadProfile();
        }
    }, [user, isAuthLoading]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const profile = await getProfile(user!.id);
            if (profile) {
                setPersonType(profile.person_type || "pf");
                setFormData({
                    name: profile.full_name || user!.user_metadata?.name || "",
                    email: profile.email || user!.email || "",
                    phone: profile.phone || "",
                    cpf: profile.cpf || "",
                    cnpj: profile.cnpj || "",
                    companyName: profile.company_name || "",
                    ie: profile.state_registration || ""
                });
            } else {
                // Pre-fill from auth data
                setFormData({
                    name: user!.user_metadata?.name || "",
                    email: user!.email || "",
                    phone: "",
                    cpf: "",
                    cnpj: "",
                    companyName: "",
                    ie: ""
                });
            }
        } catch (error) {
            console.error("Error loading profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const result = await updateProfile(user.id, {
                person_type: personType,
                full_name: formData.name,
                email: formData.email, // Read-only ideally, but saving for sync
                phone: formData.phone,
                cpf: formData.cpf,
                cnpj: formData.cnpj,
                company_name: formData.companyName,
                state_registration: formData.ie
            });

            if (result.success) {
                alert("Dados atualizados com sucesso!");
            } else {
                alert("Erro ao atualizar dados.");
            }
        } catch (error) {
            alert("Erro inesperado.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 9) {
            value = `${value.slice(0, 9)}-${value.slice(9)}`;
        }
        setFormData({ ...formData, phone: value });
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setFormData({ ...formData, cpf: value });
    };

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 14) value = value.slice(0, 14);
        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
        setFormData({ ...formData, cnpj: value });
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center gap-4">
                <Link href="/perfil" className="text-gray-500 hover:text-brand transition-colors p-1">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Meus Dados</h1>
            </div>

            <Container className="pt-6">
                <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Person Type Toggle */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Pessoa</label>
                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setPersonType("pf")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${personType === "pf"
                                        ? "bg-white text-brand shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Pessoa Física
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPersonType("pj")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${personType === "pj"
                                        ? "bg-white text-brand shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Pessoa Jurídica
                                </button>
                            </div>
                        </div>

                        {/* Common Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    {personType === "pf" ? "Nome Completo" : "Razão Social"}
                                </label>
                                <input
                                    type="text"
                                    value={personType === "pf" ? formData.name : formData.companyName}
                                    onChange={(e) => personType === "pf"
                                        ? setFormData({ ...formData, name: e.target.value })
                                        : setFormData({ ...formData, companyName: e.target.value })
                                    }
                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full h-11 px-4 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Celular / WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    maxLength={15}
                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                        </div>

                        {/* Specific Fields */}
                        {personType === "pf" ? (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={handleCpfChange}
                                        maxLength={14}
                                        placeholder="000.000.000-00"
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
                                    <input
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={handleCnpjChange}
                                        maxLength={18}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Inscrição Estadual</label>
                                    <input
                                        type="text"
                                        value={formData.ie}
                                        onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                                        placeholder="Isento ou número"
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
