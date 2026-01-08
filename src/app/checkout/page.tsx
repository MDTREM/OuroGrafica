"use client";

import { Container } from "@/components/ui/Container";
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, DollarSign, MapPin, Truck, Calendar, Lock, User, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutPage() {
    const { total, shipping, items, clearCart, discount } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1); // 1: Identification, 2: Delivery, 3: Payment
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [loadingCep, setLoadingCep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"credit" | "pix">("credit");

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

    // Card Masks
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 16) value = value.slice(0, 16);
        value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Add space every 4 digits
        setFormData({ ...formData, cardNumber: value });
    }

    const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        setFormData({ ...formData, cardExpiry: value });
    }

    const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.slice(0, 4);
        setFormData({ ...formData, cardCvv: value });
    }

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

    const isStep3Valid = () => {
        if (paymentMethod === "credit") {
            return formData.cardNumber.length >= 13 && formData.cardName && formData.cardExpiry.length === 5 && formData.cardCvv.length >= 3;
        }
        return true; // Pix e Boleto não precisam de validação extra por enquanto
    };

    const handleFinishOrder = async () => {
        if (!isStep3Valid()) {
            alert("Por favor, preencha os dados do cartão corretamente.");
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            customer_info: {
                ...formData,
                type: personType
            },
            address_info: {
                zip: formData.zip,
                address: formData.address,
                number: formData.number,
                complement: formData.complement,
                district: formData.district,
                city: formData.city,
                state: formData.state,
                shipping_method: 'pickup' // Hardcoded for now as per UI
            },
            payment_method: paymentMethod,
            total: total,
            items: items,
            userId: user?.id
        };

        try {
            const { createOrder } = await import('@/actions/checkout-actions');
            const res = await createOrder(orderData);

            if (res.success && res.orderId) {
                clearCart();
                router.push(`/checkout/sucesso/${res.orderId}`);
            } else {
                alert(res.error || 'Ocorreu um erro ao finalizar o pedido. Tente novamente.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            alert('Erro inesperado. Tente novamente.');
            setIsSubmitting(false);
        }
    };

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
                                {/* PF / PJ Toggle */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Pessoa</label>
                                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 max-w-xs">
                                        <button type="button" onClick={() => setPersonType("pf")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${personType === "pf" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Pessoa Física</button>
                                        <button type="button" onClick={() => setPersonType("pj")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${personType === "pj" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Pessoa Jurídica</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{personType === "pf" ? "Nome Completo" : "Razão Social"}</label>
                                        <input
                                            type="text"
                                            value={personType === "pf" ? formData.name : formData.companyName}
                                            onChange={(e) => personType === "pf" ? setFormData({ ...formData, name: e.target.value }) : setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            placeholder={personType === "pf" ? "Seu nome" : "Nome da empresa"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Celular</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            placeholder="(00) 00000-0000"
                                            className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                        />
                                    </div>

                                    {personType === "pf" ? (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                                            <input
                                                type="text"
                                                value={formData.cpf}
                                                onChange={handleCpfChange}
                                                placeholder="000.000.000-00"
                                                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
                                                <input
                                                    type="text"
                                                    value={formData.cnpj}
                                                    onChange={handleCnpjChange}
                                                    placeholder="00.000.000/0000-00"
                                                    className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Inscrição Estadual</label>
                                                <input
                                                    type="text"
                                                    value={formData.ie}
                                                    onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                                                    className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={!isStep1Valid()}
                                        className="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continuar
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Summary of Step 1
                            <div className="text-sm text-gray-600 pl-8">
                                <p className="font-medium">{personType === "pf" ? formData.name : formData.companyName}</p>
                                <p>{formData.email} • {formData.phone}</p>
                            </div>
                        )}
                    </div>

                    {/* 2. Delivery Address */}
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 2 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm opacity-60"}`}>
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
                    <div className={`bg-white p-6 rounded-xl border transition-all ${step === 3 ? "border-brand shadow-md ring-1 ring-brand/10" : "border-gray-100 shadow-sm opacity-60"}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-brand text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
                                Pagamento
                            </h2>
                        </div>

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-6">
                                    {/* Tabs */}
                                    <div className="flex border-b border-gray-200 bg-white">
                                        <button onClick={() => setPaymentMethod("credit")} className={`flex-1 py-3 text-sm font-bold transition-colors ${paymentMethod === "credit" ? "text-gray-900 bg-gray-50 box-shadow-inner border-b-2 border-brand" : "text-gray-400 hover:text-gray-600"}`}>Cartão</button>
                                        <button onClick={() => setPaymentMethod("pix")} className={`flex-1 py-3 text-sm font-bold transition-colors ${paymentMethod === "pix" ? "text-gray-900 bg-gray-50 border-b-2 border-brand" : "text-gray-400 hover:text-gray-600"}`}>Pix</button>
                                    </div>

                                    <div className="p-6">
                                        {paymentMethod === "credit" && (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-3 text-gray-400" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="Número do Cartão"
                                                        value={formData.cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="Nome Impresso no Cartão"
                                                        value={formData.cardName}
                                                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                                                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="relative flex-1">
                                                        <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder="MM/AA"
                                                            value={formData.cardExpiry}
                                                            onChange={handleCardExpiryChange}
                                                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
                                                        />
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder="CVV"
                                                            value={formData.cardCvv}
                                                            onChange={handleCardCvvChange}
                                                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {paymentMethod === "pix" && <div className="text-center text-sm text-gray-500">QR Code será gerado ao finalizar.</div>}
                                    </div>
                                </div>

                                {/* Security Badges */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                        <Lock size={16} className="text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700">Ambiente Seguro</p>
                                            <p className="text-[10px] text-green-600">Seus dados estão protegidos</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <CheckCircle size={16} className="text-orange-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-orange-700">Pagamento Certificado</p>
                                            <p className="text-[10px] text-orange-600">Processado por Asaas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary inside content */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                    <div className="space-y-4 mb-4 border-b border-gray-100 pb-4">
                                        <h4 className="font-bold text-gray-900 text-sm">Itens</h4>
                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                                        {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-900 line-clamp-2">{item.title}</p>
                                                        <p className="text-[10px] text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                                                        {item.details?.dimensions && (
                                                            <p className="text-[10px] text-gray-600 bg-gray-100 px-1 py-0.5 rounded w-fit mt-0.5 border border-gray-200">
                                                                {item.details.dimensions.width}x{item.details.dimensions.height} cm
                                                            </p>
                                                        )}
                                                        {item.details?.selectedVariations && Object.entries(item.details.selectedVariations).map(([key, value]) => (
                                                            <p key={key} className="text-[10px] text-gray-500 mt-0.5">
                                                                {key}: <span className="font-medium text-gray-700">{value}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-900">
                                                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="text-gray-700">R$ {(total - shipping + discount).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-green-600 font-medium">Desconto</span>
                                                <span className="text-green-600 font-bold">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Frete</span>
                                            <span className="text-gray-700">{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900">Total a pagar</span>
                                        <span className="text-xl font-bold text-brand">R$ {total.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">Ao finalizar, você concorda com os <Link href="/termos-de-uso" target="_blank" className="underline hover:text-gray-600">termos</Link>.</p>
                                </div>

                                <button
                                    onClick={handleFinishOrder}
                                    disabled={isSubmitting}
                                    className="w-full bg-brand text-white font-bold h-12 rounded-full hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> Processando...
                                        </>
                                    ) : (
                                        "Finalizar Pedido"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
