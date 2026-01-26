"use client";

import { Container } from "@/components/ui/Container";
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, DollarSign, MapPin, Truck, Calendar, Lock, User, ChevronRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutPage() {
    const { total, shipping, items, clearCart, discount } = useCart();
    const { user, signOut } = useAuth();

    const [step, setStep] = useState(1); // 1: Identification, 2: Delivery, 3: Payment
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [loadingCep, setLoadingCep] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"credit" | "pix">("credit");
    // const [scriptLoaded, setScriptLoaded] = useState(false);

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

    // --- Script Injection for Efí Card ---
    // const loadEfiScript = () => {
    //     setScriptLoaded(false);
    //     setConnectionStatus('Carregando script...');
    //     const accountId = process.env.NEXT_PUBLIC_EFI_ACCOUNT_ID;

    //     // If ID matches placeholder or is missing, log but Unblock UI
    //     if (!accountId || accountId.includes("INSERIR")) {
    //         console.error("Efí Account ID missing or invalid:", accountId);
    //         setConnectionStatus('ID Inválido');
    //         setScriptLoaded(true);
    //         return;
    //     }

    //     const scriptId = 'efi-payment-token-script';

    //     // Remove existing if any to force reload
    //     const existing = document.getElementById(scriptId);
    //     if (existing) existing.remove();

    //     // Initialize $gn stub if not exists
    //     // @ts-ignore
    //     if (typeof window.$gn === 'undefined') {
    //         // @ts-ignore
    //         window.$gn = { validForm: true, processed: false, done: {}, ready: function (fn) { window.$gn.done = fn; } };
    //     }

    //     const script = document.createElement('script');
    //     script.id = scriptId;
    //     script.type = 'text/javascript';
    //     script.async = true;

    //     // Random version buster as per Efí docs
    //     const v = parseInt(String(Math.random() * 1000000));
    //     // Efí Official CDN Script
    //     script.src = `https://cdn.jsdelivr.net/gh/efipay/js-payment-token-efi/dist/payment-token-efi.min.js?v=${v}`;

    //     script.onload = () => {
    //         console.log("Efí Script Source Loaded (CDN)");

    //         // Wait a small moment to ensure global is set, or retry
    //         let attempts = 0;
    //         const checkEfiPay = setInterval(() => {
    //             attempts++;
    //             // @ts-ignore
    //             if (typeof window.EfiPay !== 'undefined') {
    //                 clearInterval(checkEfiPay);
    //                 console.log("Global EfiPay Available");
    //                 setScriptLoaded(true);
    //                 setConnectionStatus('Conectado');
    //             } else {
    //                 console.log(`Waiting for EfiPay... (${attempts})`);
    //                 if (attempts >= 10) { // 5 seconds max
    //                     clearInterval(checkEfiPay);
    //                     console.error("EfiPay not defined after timeout");
    //                     setConnectionStatus('Erro ao inicializar');
    //                     setScriptLoaded(true); // Let it fail gracefully or show error
    //                 }
    //             }
    //         }, 500);
    //     };

    //     script.onerror = () => {
    //         console.error("Error loading Efí Script from CDN");
    //         setConnectionStatus('Erro ao baixar');
    //         setScriptLoaded(true);
    //     };

    //     document.body.appendChild(script);
    // };

    // useEffect(() => {
    //     loadEfiScript();
    // }, []);

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



    const getCardBrand = (number: string) => {
        const n = number.replace(/\D/g, "");
        if (n.match(/^4/)) return "visa";
        if (n.match(/^5[1-5]/)) return "mastercard";
        if (n.match(/^3[47]/)) return "amex";
        if (n.match(/^(4011|4389|4514|4576|5041|5066|509|6277|6362|6363|650|6516|6550)/)) return "elo";
        return "visa"; // default fallback
    };


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

                if (paymentMethod === 'pix') {
                    const { createPixOrder } = await import('@/actions/checkout-actions');
                    const res = await createPixOrder(checkoutPayload);
                    if (res.success && res.order && res.order.id) {
                        clearCart();
                        router.push(`/checkout/sucesso/${res.order.id}`);
                    } else {
                        throw new Error(res.error || "Erro ao criar PIX.");
                    }
                } else {
                    // Credit Card Flow (Transparent)
                    const { createCreditCardOrder } = await import('@/actions/checkout-actions');

                    // 1. Get Payment Token from Efí Script (Frontend)
                    try {
                        const accountId = process.env.NEXT_PUBLIC_EFI_ACCOUNT_ID;
                        if (!accountId || accountId.includes("INSERIR")) {
                            throw new Error("Configuração (Account ID) ausente.");
                        }

                        console.log("Iniciando geração de token...");
                        setConnectionStatus("Validando Cartão...");

                        // Dynamic import for client-side execution
                        const EfiPayModule = await import("payment-token-efi");
                        // The default export might be EfiPay or named export. README says: import EfiPay from ...
                        const EfiPay = EfiPayModule.default || EfiPayModule;

                        const result = await EfiPay.CreditCard
                            .setAccount(accountId)
                            .setEnvironment("production") // or "sandbox" based on logic? Defaulting production per user context usually
                            .setCreditCardData({
                                brand: getCardBrand(formData.cardNumber),
                                number: formData.cardNumber.replace(/\s/g, ""),
                                cvv: formData.cardCvv,
                                expirationMonth: formData.cardExpiry.split('/')[0],
                                expirationYear: `20${formData.cardExpiry.split('/')[1]}`,
                                holderName: formData.cardName,
                                holderDocument: personType === 'pf' ? formData.cpf : formData.cnpj,
                                reuse: false
                            })
                            .getPaymentToken();

                        const paymentToken = result.payment_token;
                        console.log("Token gerado:", paymentToken);


                        setConnectionStatus("Processando Pagamento...");

                        // 3. Processar Pedido no Backend com Token
                        const res = await createCreditCardOrder({
                            ...checkoutPayload,
                            paymentToken: paymentToken,
                            installments: 1, // Default 1 for now
                            billingAddress: {
                                street: formData.address,
                                number: formData.number,
                                neighborhood: formData.district,
                                zip: formData.zip,
                                city: formData.city,
                                state: formData.state,
                                complement: formData.complement
                            },
                            cardHolder: {
                                name: formData.cardName,
                                cpf: personType === 'pf' ? formData.cpf : formData.cnpj,
                                email: formData.email,
                                phone: formData.phone,
                                birth: "1990-01-01" // Logic to add birth if needed
                            }
                        });

                        if (res.success && res.order && res.order.id) {
                            clearCart();
                            router.push(`/checkout/sucesso/${res.order.id}`);
                        } else {
                            throw new Error(res.error || "Pagamento recusado.");
                        }

                    } catch (err: any) {
                        console.error("Card processing error:", err);
                        // Extract meaningful error
                        const msg = err.error_description || err.message || "Erro ao processar cartão.";
                        throw new Error(`Erro no pagamento: ${msg}`);
                    }
                }
            } catch (error: any) {
                console.error(error);
                setErrorMessage(error.message || 'Erro inesperado. Tente novamente.');
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
                // Attempt to load profile data if needed, but for now name/email is good start
            }));
            // If already on Step 1, auto-advance if we want, but better to let them review
            // Actually, if they just logged in via our new form, we call setStep(2) manually.
            // But if they came already logged in, they see the "Welcome" screen.
        }
    }, [user]);

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-24">
            {/* Overlay for Redirecting */}
            {connectionStatus === 'Redirecionando...' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-8 h-8 text-brand animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecionando</h2>
                        <p className="text-gray-500 mb-6">Aguarde, estamos te levando para o ambiente seguro da Efí...</p>

                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand animate-progress origin-left w-full"></div>
                        </div>
                    </div>
                </div>
            )}

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

                        {/* 3. Payment */}
                        {step === 3 && (
                            <div className="bg-white p-6 rounded-xl border border-brand shadow-md ring-1 ring-brand/10 animate-in fade-in slide-in-from-bottom-2">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs">3</div>
                                    Pagamento
                                </h2>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'pix' ? "border-brand bg-orange-50/50 text-brand ring-1 ring-brand" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                                    >
                                        <div className="font-bold mb-1">PIX</div>
                                        <div className="text-xs">Aprovação Imediata</div>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('credit')}
                                        className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'credit' ? "border-brand bg-orange-50/50 text-brand ring-1 ring-brand" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                                    >
                                        <div className="font-bold mb-1">Cartão de Crédito</div>
                                        <div className="text-xs">Até 12x</div>
                                    </button>
                                </div>

                                {paymentMethod === 'pix' && (
                                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100 mb-6">
                                        <p className="text-green-800 font-medium">PIX: Aprovação Imediata</p>
                                        <p className="text-sm text-green-600 mt-1">O QR Code será gerado na próxima tela.</p>
                                    </div>
                                )}

                                {paymentMethod === 'credit' && (
                                    <div className="space-y-4 mb-6">
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Número do Cartão"
                                                value={formData.cardNumber}
                                                onChange={handleCardNumberChange}
                                                maxLength={19}
                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                            />
                                        </div>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Nome Impresso no Cartão"
                                                value={formData.cardName}
                                                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="MM/AA"
                                                    value={formData.cardExpiry}
                                                    onChange={handleCardExpiryChange}
                                                    maxLength={5}
                                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="CVV"
                                                    value={formData.cardCvv}
                                                    onChange={handleCardCvvChange}
                                                    maxLength={4}
                                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start gap-2 relative">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span className="flex-1">{errorMessage}</span>
                                        <button onClick={() => setErrorMessage(null)} className="absolute top-2 right-2 text-red-400 hover:text-red-700">
                                            <span className="sr-only">Fechar</span>
                                            x
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleFinishOrder}
                                    disabled={isSubmitting}
                                    className="w-full bg-brand hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'pix' ? 'Gerar PIX' : 'Finalizar Pedido'}
                                            <ArrowRight size={20} />
                                        </>
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

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
    const { signIn, signUp, signInWithSocial } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [cpf, setCpf] = useState("");

    const formatPhone = (val: string) => {
        return val.replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d)(\d{4})$/, "$1-$2")
            .slice(0, 15);
    };

    const formatCpf = (val: string) => {
        return val.replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, name, phone, cpf);
                if (error) throw error;
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("Invalid login")) {
                setError("E-mail ou senha incorretos.");
            } else if (err.message.includes("already registered")) {
                setError("Este e-mail já está cadastrado. Faça login.");
                setMode('login');
            } else {
                setError("Erro ao autenticar. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithSocial('google', { next: '/checkout' });
            if (error) throw error;
            // Redirect happens automatically
        } catch (err) {
            console.error(err);
            setError("Erro ao conectar com Google.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continuar com Google
                </button>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative z-10 bg-white px-2 text-sm text-gray-400">ou entre com e-mail</span>
                </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'register' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Criar Conta
                </button>
                <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'login' ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Já tenho conta
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <div className="animate-in fade-in slide-in-from-top-1 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                                <input
                                    type="text"
                                    required
                                    value={cpf}
                                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:brand-ring"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (mode === 'register' ? 'Criar Conta e Continuar' : 'Entrar e Continuar')}
                </button>
            </form>
        </div>
    );
}
