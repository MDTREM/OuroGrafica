"use client";

import { Container } from "@/components/ui/Container";
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, DollarSign, MapPin, Truck, Calendar, Lock, User, ChevronRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
    const { total, shipping, items, clearCart, discount } = useCart();
    const { user, signOut } = useAuth();

    const [step, setStep] = useState(1); // 1: Identification, 2: Delivery, 3: Payment
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [loadingCep, setLoadingCep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"pix">("pix");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        ie: "",
        companyName: "",
        zip: "",
        address: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvv: ""
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('Aguardando...');

    // --- Masks & Handlers ---

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
        let formatted = value;
        if (value.length > 2) {
            formatted = `(${value.slice(0, 2)}) `;
            if (value.length > 7) {
                if (value.length === 11) {
                    formatted += `${value.slice(2, 7)}-${value.slice(7)}`;
                } else {
                    formatted += `${value.slice(2, 6)}-${value.slice(6)}`;
                }
            } else {
                formatted += value.slice(2);
            }
        }

        setFormData({ ...formData, phone: formatted });
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

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);

        let formatted = value;
        if (value.length > 5) formatted = `${value.slice(0, 5)}-${value.slice(5)}`;

        setFormData(prev => ({ ...prev, zip: formatted }));

        if (value.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        zip: formatted,
                        address: data.logradouro,
                        district: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                    // Optional: Focus number field
                    document.getElementById("number")?.focus();
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    // --- Validation Logic ---

    const isStep1Valid = () => {
        const common = formData.email && formData.phone.length >= 14; // (XX) XXXX-XXXX is 14 chars
        if (personType === "pf") {
            return common && formData.name && formData.cpf.length === 14;
        } else {
            return common && formData.companyName && formData.cnpj.length >= 18; // CNPJ mask length is 18
        }
    };

    const isStep2Valid = () => {
        return formData.zip && formData.address && formData.number && formData.district && formData.city && formData.state;
    };

    const nextStep = () => {
        if (step === 1 && isStep1Valid()) setStep(2);
        if (step === 2 && isStep2Valid()) setStep(3);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleFinishOrder = async () => {
        setErrorMessage(null);
        if (step === 3) {
            setIsSubmitting(true);
            setErrorMessage('');

            try {
                const checkoutPayload = {
                    userId: user?.id,
                    items: items, // Assuming 'items' is available in scope
                    total: total, // Assuming 'total' is available in scope
                    customer: {
                        name: personType === 'pf' ? formData.name : formData.companyName,
                        cpf: personType === 'pf' ? formData.cpf : formData.cnpj,
                        email: formData.email,
                        phone: formData.phone
                    },
                    address: {
                        zip: formData.zip,
                        street: formData.address,
                        number: formData.number,
                        complement: formData.complement,
                        district: formData.district,
                        city: formData.city,
                        state: formData.state
                    }
                };

                // Only PIX Flow
                const { createPixOrder } = await import('@/actions/checkout-actions');
                const res = await createPixOrder(checkoutPayload);
                if (res.success && res.order && res.order.id) {
                    clearCart();
                    router.push(`/checkout/sucesso/${res.order.id}`);
                } else {
                    throw new Error(res.error || "Erro ao criar PIX.");
                }

            } catch (error: unknown) {
                console.error(error);
                const errorAny = error as any;
                setErrorMessage(errorAny.message || 'Erro inesperado. Tente novamente.');
                setIsSubmitting(false);
            }
        }
    };

    // Pre-fill data if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.user_metadata?.full_name || prev.name,
                email: user.email || prev.email,
                phone: user.user_metadata?.phone || prev.phone,
                cpf: user.user_metadata?.cpf || prev.cpf,
            }));
        }
    }, [user]);

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center gap-4">
                    <Link href="/carrinho" className="text-gray-500 hover:text-brand transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-8">Checkout</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-2xl mx-auto">
                <div className="space-y-6">
                    {/* 1. Identification */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 1 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-brand text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
                                Identificação
                            </h2>
                            {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-bold text-brand hover:underline">Alterar</button>}
                        </div>

                        {step === 1 ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-green-800 font-bold">Conectado como</p>
                                                    <p className="text-sm text-gray-700">{user.user_metadata?.full_name || user.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">
                                                Sair
                                            </button>
                                        </div>

                                        {/* Missing Data Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={handlePhoneChange}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <div className="flex gap-4 mb-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="personType"
                                                            checked={personType === "pf"}
                                                            onChange={() => setPersonType("pf")}
                                                            className="accent-brand"
                                                        />
                                                        <span className="text-sm font-medium">Pessoa Física</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="personType"
                                                            checked={personType === "pj"}
                                                            onChange={() => setPersonType("pj")}
                                                            className="accent-brand"
                                                        />
                                                        <span className="text-sm font-medium">Pessoa Jurídica</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {personType === "pf" ? (
                                                <>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                                                        <input
                                                            type="text"
                                                            value={formData.cpf}
                                                            onChange={handleCpfChange}
                                                            placeholder="000.000.000-00"
                                                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Razão Social</label>
                                                        <input
                                                            type="text"
                                                            value={formData.companyName}
                                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
                                                        <input
                                                            type="text"
                                                            value={formData.cnpj}
                                                            onChange={handleCnpjChange}
                                                            placeholder="00.000.000/0000-00"
                                                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Inscrição Estadual (Opcional)</label>
                                                        <input
                                                            type="text"
                                                            value={formData.ie}
                                                            onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={!isStep1Valid()}
                                                className="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Ir para Entrega
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <AuthForm onSuccess={() => setStep(2)} />
                                )}
                            </div>
                        ) : (
                            // Summary of Step 1
                            <div className="text-sm text-gray-600 pl-8 flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{user?.user_metadata?.full_name || personType === "pf" ? formData.name : formData.companyName}</p>
                                    <p>{user?.email || formData.email} • {formData.phone}</p>
                                </div>
                                <CheckCircle size={18} className="text-green-500" />
                            </div>
                        )}
                    </div>

                    {/* 2. Delivery Address */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 2 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-brand text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
                                Entrega
                            </h2>
                            {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-bold text-brand hover:underline">Alterar</button>}
                        </div>

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.zip}
                                                onChange={handleCepChange}
                                                maxLength={9}
                                                placeholder="00000-000"
                                                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                            {loadingCep && <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-brand" />}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Número</label>
                                        <input
                                            id="number"
                                            type="text"
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Complemento</label>
                                        <input
                                            type="text"
                                            value={formData.complement}
                                            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Bairro</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Cidade - UF</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.city}
                                                readOnly
                                                className="flex-1 h-10 px-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                            <input
                                                type="text"
                                                value={formData.state}
                                                readOnly
                                                className="w-16 h-10 px-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Opção de Entrega</h3>
                                <div className="space-y-3 mb-6">
                                    <label className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-brand cursor-pointer relative">
                                        <div className="w-10 h-10 rounded-full bg-white text-brand flex items-center justify-center flex-shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="font-bold text-gray-900 text-sm">Retirada na Loja (Ouro Preto)</h3>
                                                <span className="font-bold text-brand">Grátis</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Rua José Moringa, 9 - Bauxita</p>
                                        </div>
                                        <input type="radio" name="shipping" className="accent-brand w-5 h-5 ml-2" defaultChecked />
                                    </label>

                                    <label className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer relative opacity-60">
                                        <div className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center flex-shrink-0">
                                            <Truck size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="font-bold text-gray-900 text-sm">Entrega Local (Motoboy)</h3>
                                                <span className="font-bold text-gray-500">Em breve</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Disponível apenas para Ouro Preto</p>
                                        </div>
                                        <input type="radio" name="shipping" className="accent-brand w-5 h-5 ml-2" disabled />
                                    </label>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={!isStep2Valid()}
                                        className="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Ir para Pagamento
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        {step > 2 && (
                            <div className="text-sm text-gray-600 pl-8">
                                <p className="font-medium">{formData.address}, {formData.number} {formData.complement && `- ${formData.complement}`}</p>
                                <p>{formData.district}, {formData.city} - {formData.state}</p>
                            </div>
                        )}
                    </div>

                    {/* 3. Payment */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 3 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-brand text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
                                Pagamento
                            </h2>
                        </div>

                        {step === 3 && (
                            <div className="bg-white p-6 rounded-xl border border-brand shadow-md ring-1 ring-brand/10 animate-in fade-in slide-in-from-bottom-2">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs">3</div>
                                    Pagamento
                                </h2>

                                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100 mb-6">
                                    <h3 className="text-lg font-bold text-green-800 mb-2">Pagamento via Pix</h3>
                                    <p className="text-green-700 font-medium">Aprovação Imediata + 5% de Desconto</p>
                                    <p className="text-sm text-green-600 mt-2">O código QR (Copia e Cola) será gerado na próxima tela após finalizar o pedido.</p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleFinishOrder}
                                        disabled={isSubmitting}
                                        className="bg-brand text-white font-bold py-4 px-8 rounded-xl hover:bg-brand/90 transition-all shadow-xl shadow-brand/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            <>
                                                Finalizar Pedido
                                                <CheckCircle size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <AlertCircle size={20} />
                        {errorMessage}
                    </div>
                )}
            </Container>
        </div>
    );
}
