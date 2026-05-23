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
    const { total, shipping, setShipping, items, clearCart, discount, coupon, productTotal, designFees } = useCart();
    const { user, signOut } = useAuth();

    const [step, setStep] = useState(1); // 1: Identification, 2: Delivery, 3: Payment
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [loadingCep, setLoadingCep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");

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
        if (step === 3) setStep(4);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleFinishOrder = async () => {
        setErrorMessage(null);
        if (step === 4) {
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
                    },
                    couponCode: coupon?.code
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
                    <Link href="/carrinho" className="text-gray-500 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900 flex-1 text-center pr-8">Checkout</h1>
                </Container>
            </div>

            <Container className="pt-6 pb-24 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main Flow */}
                    <div className="flex-1 space-y-6 w-full max-w-2xl lg:max-w-none mx-auto">
                    {/* 1. Identification */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 1 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-gradient-to-r from-brand to-brand-dark text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
                                Identificação
                            </h2>
                            {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:underline">Alterar</button>}
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
                                                    <p className="text-sm text-green-800 font-semibold">Conectado como</p>
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={handlePhoneChange}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
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
                                                            className="appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-full checked:border-brand checked:border-[5px] sm:checked:border-[6px] transition-all bg-white flex-shrink-0 cursor-pointer shadow-sm"
                                                        />
                                                        <span className="text-sm font-medium">Pessoa Física</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="personType"
                                                            checked={personType === "pj"}
                                                            onChange={() => setPersonType("pj")}
                                                            className="appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-full checked:border-brand checked:border-[5px] sm:checked:border-[6px] transition-all bg-white flex-shrink-0 cursor-pointer shadow-sm"
                                                        />
                                                        <span className="text-sm font-medium">Pessoa Jurídica</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {personType === "pf" ? (
                                                <>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label>
                                                        <input
                                                            type="text"
                                                            value={formData.cpf}
                                                            onChange={handleCpfChange}
                                                            placeholder="000.000.000-00"
                                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Razão Social</label>
                                                        <input
                                                            type="text"
                                                            value={formData.companyName}
                                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
                                                        <input
                                                            type="text"
                                                            value={formData.cnpj}
                                                            onChange={handleCnpjChange}
                                                            placeholder="00.000.000/0000-00"
                                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Inscrição Estadual (Opcional)</label>
                                                        <input
                                                            type="text"
                                                            value={formData.ie}
                                                            onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={!isStep1Valid()}
                                                className="bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3 px-6 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-gradient-to-r from-brand to-brand-dark text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
                                Entrega
                            </h2>
                            {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:underline">Alterar</button>}
                        </div>

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">CEP</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.zip}
                                                onChange={handleCepChange}
                                                maxLength={9}
                                                placeholder="00000-000"
                                                className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                            {loadingCep && <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark" />}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Número</label>
                                        <input
                                            id="number"
                                            type="text"
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                                        <input
                                            type="text"
                                            value={formData.complement}
                                            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade - UF</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.city}
                                                readOnly
                                                className="flex-1 h-10 px-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                            <input
                                                type="text"
                                                value={formData.state}
                                                readOnly
                                                className="w-16 h-10 px-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Opção de Entrega</h3>
                                <div className="space-y-3 mb-6">
                                    <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer relative transition-all ${shipping === 15.00 ? 'bg-orange-50 border-brand' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${shipping === 15.00 ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark' : 'text-gray-500'}`}>
                                            <Truck size={18} className="sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start sm:items-center mb-0.5 gap-2">
                                                <h3 className="font-semibold text-gray-900 text-sm leading-tight">Entrega Padrão (Jadlog)</h3>
                                                <span className={`font-semibold whitespace-nowrap ${shipping === 15.00 ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark' : 'text-gray-900'}`}>R$ 15,00</span>
                                            </div>
                                            <p className="text-xs text-gray-500">3 a 5 dias úteis</p>
                                        </div>
                                        <input type="radio" name="shipping" checked={shipping === 15.00} onChange={() => setShipping(15.00)} className="appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-full checked:border-brand checked:border-[5px] sm:checked:border-[6px] transition-all bg-white ml-2 flex-shrink-0 cursor-pointer shadow-sm" />
                                    </label>

                                    <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer relative transition-all ${shipping === 32.90 ? 'bg-orange-50 border-brand' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${shipping === 32.90 ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark' : 'text-gray-500'}`}>
                                            <Truck size={18} className="sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start sm:items-center mb-0.5 gap-2">
                                                <h3 className="font-semibold text-gray-900 text-sm leading-tight">Sedex Express</h3>
                                                <span className={`font-semibold whitespace-nowrap ${shipping === 32.90 ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark' : 'text-gray-900'}`}>R$ 32,90</span>
                                            </div>
                                            <p className="text-xs text-gray-500">1 a 2 dias úteis</p>
                                        </div>
                                        <input type="radio" name="shipping" checked={shipping === 32.90} onChange={() => setShipping(32.90)} className="appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-full checked:border-brand checked:border-[5px] sm:checked:border-[6px] transition-all bg-white ml-2 flex-shrink-0 cursor-pointer shadow-sm" />
                                    </label>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={!isStep2Valid()}
                                        className="bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3 px-6 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-gradient-to-r from-brand to-brand-dark text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
                                Pagamento
                            </h2>
                        </div>

                        {step === 3 && (
                            <div className="bg-white pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Payment Method Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'pix' ? 'bg-green-50 border-brand' : 'bg-white border-gray-200 hover:border-brand/50'}`}>
                                        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${paymentMethod === 'pix' ? 'text-brand' : 'text-gray-400'}`}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className={`font-semibold text-sm ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-700'}`}>Pix</h3>
                                            </div>
                                            <p className="text-xs text-gray-500">Aprovação imediata</p>
                                        </div>
                                        <input type="radio" name="payment" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} className="accent-brand w-5 h-5 ml-2" />
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'bg-green-50 border-brand' : 'bg-white border-gray-200 hover:border-brand/50'}`}>
                                        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${paymentMethod === 'credit_card' ? 'text-brand' : 'text-gray-400'}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className={`font-semibold text-sm ${paymentMethod === 'credit_card' ? 'text-gray-900' : 'text-gray-700'}`}>Cartão de Crédito</h3>
                                            </div>
                                            <p className="text-xs text-gray-500">Até 3x sem juros</p>
                                        </div>
                                        <input type="radio" name="payment" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="accent-brand w-5 h-5 ml-2" />
                                    </label>
                                </div>

                                {/* Payment Details Block */}
                                {paymentMethod === 'pix' ? (
                                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100 mb-6 animate-in fade-in">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pagamento via Pix</h3>
                                        <p className="text-sm text-gray-600 mt-2">O código QR (Copia e Cola) será gerado na próxima tela após finalizar o pedido.</p>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100 mb-6 animate-in fade-in">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cartão de Crédito</h3>
                                        <p className="text-sm text-gray-600 mt-2">O pagamento será processado de forma segura na próxima etapa.</p>
                                    </div>
                                )}

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={nextStep}
                                        className="bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3 px-6 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all flex items-center gap-2"
                                    >
                                        Revisar Pedido
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        {step > 3 && (
                            <div className="text-sm text-gray-600 pl-8">
                                <p className="font-medium">{paymentMethod === 'pix' ? 'Pix (Aprovação Imediata)' : 'Cartão de Crédito'}</p>
                            </div>
                        )}
                    </div>

                    {/* 4. Review */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 4 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? "bg-gradient-to-r from-brand to-brand-dark text-white" : "bg-gray-200 text-gray-500"}`}>4</div>
                                Revisão e Confirmação
                            </h2>
                        </div>

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 mb-6 space-y-4">
                                    {/* Revisão de Entrega */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Entrega</h3>
                                        <p className="text-sm text-gray-600">{formData.address}, {formData.number} {formData.complement && `- ${formData.complement}`}</p>
                                        <p className="text-sm text-gray-600">{formData.district}, {formData.city} - {formData.state}</p>
                                        <p className="text-sm text-gray-600 font-medium mt-1">Frete: {shipping === 15.00 ? "Entrega Padrão" : "Sedex Express"} - R$ {shipping.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="h-px bg-gray-200 w-full" />
                                    {/* Revisão de Pagamento */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Pagamento</h3>
                                        <p className="text-sm text-gray-600">{paymentMethod === 'pix' ? 'Pix (Aprovação imediata)' : 'Cartão de Crédito'}</p>
                                    </div>
                                </div>
                                
                                 <div className="mb-6 p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-center gap-2">
                                     <AlertCircle size={16} className="text-brand flex-shrink-0" />
                                     <span className="text-xs font-semibold text-gray-700">
                                         O prazo começa a contar após aprovação da arte e confirmação do pagamento.
                                     </span>
                                 </div>

                                 <p className="text-xs text-gray-500 text-center mb-6 px-4">
                                     Ao clicar em finalizar, você concorda com nossos termos de serviço e políticas de privacidade. Seu pedido será processado imediatamente.
                                 </p>

                                {errorMessage && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2 animate-in slide-in-from-bottom-2">
                                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleFinishOrder}
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-4 px-12 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            "Finalizar Pedido"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Order Summary */}
                <div className="lg:w-[400px] w-full sticky top-24 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Resumo do Pedido</h2>
                        
                        {/* Items List */}
                        <div className="space-y-4 mb-6 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => {
                                return (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-[72px] h-[72px] bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium bg-gray-200">IMG</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.title}</h3>
                                            <p className="text-[11px] text-gray-500 mt-0.5">Qtd: {item.quantity}</p>
                                            
                                            {/* Details list */}
                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-400">
                                                {item.details?.format && <span>Formato: {item.details.format}</span>}
                                                {item.details?.printing && <span>Impressão: {item.details.printing}</span>}
                                                {item.details?.finish && <span>Acabamento: {item.details.finish}</span>}
                                                {item.details?.extra && <span>Extra: {item.details.extra}</span>}
                                                {item.details?.paper && <span>Material: {item.details.paper}</span>}
                                                {item.details?.selectedVariations && Object.entries(item.details.selectedVariations)
                                                    .filter(([k, v]) => v && v !== "-" && k !== "Papel" && k !== "Material")
                                                    .map(([key, value]) => (
                                                        <span key={key}>{key}: {String(value)}</span>
                                                    ))}
                                            </div>

                                            <div className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark mt-1">
                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Totals */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6 space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Resumo do Valor Final</h3>
                            
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Valor dos Produtos</span>
                                <span>R$ {productTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            
                            {designFees > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Adicionais (Criação de Arte)</span>
                                    <span>R$ {designFees.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}

                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Desconto Aplicado</span>
                                    <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Frete</span>
                                <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Valor Final</span>
                                <span className="font-bold text-xl text-brand">R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="mt-8 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <ShieldCheck size={18} className="text-gray-400 flex-shrink-0" />
                                <span>Compra Segura</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Lock size={18} className="text-gray-400 flex-shrink-0" />
                                <span>Criptografado</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <CheckCircle size={18} className="text-gray-400 flex-shrink-0" />
                                <span>Garantia Vink</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </Container>
        </div>
    );
}
