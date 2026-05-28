"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { submitBrandingForm } from "@/actions/branding-actions";
import { 
    Check, 
    ArrowLeft, 
    Sparkles, 
    Store, 
    User, 
    Mail, 
    FileText, 
    Phone, 
    ShoppingBag, 
    DollarSign, 
    Tag, 
    MessageSquare, 
    ChevronRight,
    Sparkle,
    ChevronDown
} from "lucide-react";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import Link from "next/link";

const REVENUE_OPTIONS = [
    { value: "não inaugurou ainda", label: "Não inaugurou ainda" },
    { value: "ate 10k", label: "Até R$ 10 mil" },
    { value: "10k ate 21k", label: "De R$ 10 mil a R$ 21 mil" },
    { value: "20k a 40k", label: "De R$ 21 mil a R$ 40 mil" },
    { value: "acima de 40k", label: "Acima de R$ 40 mil" }
];

const PLAN_OPTIONS = [
    { value: "Basic Taste", label: "Basic Taste", desc: "O essencial para começar com o pé direito." },
    { value: "Combo Perfeito", label: "Combo Perfeito", desc: "Branding completo + impressos essenciais." },
    { value: "Banquete Viral", label: "Banquete Viral", desc: "O pacote definitivo para dominar sua região." },
    { value: "Vink Club", label: "Vink Club", desc: "Padronização e recorrência de materiais mensais." }
];

const NICHE_OPTIONS = [
    "Hamburgueria",
    "Pizzaria",
    "Restaurante / Self-service",
    "Comida Oriental / Sushi",
    "Doceria / Confeitaria / Cafeteria",
    "Delivery Geral",
    "Outro"
];

export default function BrandingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState("Combo Perfeito");
    const [monthlyRevenue, setMonthlyRevenue] = useState("");
    const [niche, setNiche] = useState("");
    const [customNiche, setCustomNiche] = useState("");
    
    // Form States
    const [name, setName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [email, setEmail] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [ordersPerDay, setOrdersPerDay] = useState("");
    const [brandDetails, setBrandDetails] = useState("");
    
    // UI States
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Sync selected plan with query param on load
    useEffect(() => {
        const planParam = searchParams.get("plano");
        if (planParam) {
            const matchedPlan = PLAN_OPTIONS.find(
                p => p.value.toLowerCase() === planParam.toLowerCase() || p.label.toLowerCase() === planParam.toLowerCase()
            );
            if (matchedPlan) {
                setSelectedPlan(matchedPlan.value);
            }
        }
    }, [searchParams]);

    // Formats Whatsapp Input: (XX) XXXXX-XXXX
    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setWhatsapp(value);
        if (errors.whatsapp) {
            setErrors(prev => ({ ...prev, whatsapp: "" }));
        }
    };

    // Formats CNPJ Input: XX.XXX.XXX/XXXX-XX
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 14) value = value.slice(0, 14);

        if (value.length > 12) {
            value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`;
        } else if (value.length > 8) {
            value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8)}`;
        } else if (value.length > 5) {
            value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}.${value.slice(2)}`;
        }
        setCnpj(value);
    };

    const validateForm = () => {
        const tempErrors: Record<string, string> = {};
        if (!name.trim()) tempErrors.name = "Nome completo é obrigatório";
        if (!storeName.trim()) tempErrors.storeName = "Nome da loja é obrigatório";
        if (!email.trim()) {
            tempErrors.email = "E-mail é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            tempErrors.email = "Insira um e-mail válido";
        }
        if (!whatsapp.trim()) {
            tempErrors.whatsapp = "WhatsApp é obrigatório";
        } else if (whatsapp.replace(/\D/g, "").length < 10) {
            tempErrors.whatsapp = "Insira um WhatsApp válido com DDD";
        }
        if (!ordersPerDay.trim()) tempErrors.ordersPerDay = "Informe a quantidade de pedidos diários";
        if (!monthlyRevenue) tempErrors.monthlyRevenue = "Selecione a sua faixa de faturamento";
        if (!niche) {
            tempErrors.niche = "Selecione o seu nicho ou escolha 'Outro'";
        } else if (niche === "Outro" && !customNiche.trim()) {
            tempErrors.customNiche = "Por favor, digite seu nicho";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            const firstErrorEl = document.querySelector(".text-red-500");
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);
        
        const finalNiche = niche === "Outro" ? customNiche : niche;

        const result = await submitBrandingForm({
            name,
            store_name: storeName,
            email,
            cnpj: cnpj || undefined,
            whatsapp,
            orders_per_day: ordersPerDay,
            monthly_revenue: monthlyRevenue,
            niche: finalNiche,
            brand_details: brandDetails || undefined,
            selected_plan: selectedPlan
        });

        setIsSubmitting(false);

        if (result.success) {
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            alert(`Erro ao enviar formulário: ${result.error}`);
        }
    };

    // Premium mouse glow effect for styling
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };

    if (isSubmitted) {
        return (
            <section className="py-20 md:py-28 bg-white min-h-[80vh] flex items-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <SparklesComp
                        density={120}
                        direction="bottom"
                        speed={0.4}
                        color="#15cb98"
                        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_90%)]"
                    />
                </div>

                <Container className="relative z-10 max-w-2xl text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/10 border border-brand/35 rounded-full text-brand mb-8 relative">
                        <Check size={40} className="stroke-[2.5]" />
                    </div>

                    <h1 className="text-4xl font-medium tracking-tight text-black mb-6">
                        Seu projeto está prestes a <span className="text-brand font-bold italic">decolar!</span>
                    </h1>
                    
                    <p className="text-lg text-gray-500 font-light leading-relaxed mb-10">
                        Recebemos as suas informações com sucesso. Nossa equipe de especialistas em branding já está analisando o perfil da <strong className="text-black font-semibold">{storeName}</strong>. 
                        <br />
                        <br />
                        Fique de olho no seu celular! Nós **vamos entrar em contato** com você via <span className="text-brand font-semibold">WhatsApp</span> em até 24 horas úteis para apresentar nossa proposta sob medida.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/branding" className="bg-white text-black border border-gray-200 rounded-xl px-8 py-4 font-medium transition-all hover:bg-gray-50 inline-flex items-center justify-center gap-2">
                            <ArrowLeft size={18} /> Voltar para Branding
                        </Link>
                        <a 
                            href={`https://wa.me/5531989880161?text=Olá!%20Acabei%20de%20enviar%20o%20formulário%20de%20branding%20para%20minha%20loja%20${encodeURIComponent(storeName)}.%20Gostaria%20de%20prioridade!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand text-white rounded-xl px-8 py-4 font-medium transition-all hover:bg-[#10a379] inline-flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
                        >
                            Falar no WhatsApp <Phone size={18} fill="currentColor" className="stroke-none" />
                        </a>
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-20 bg-gray-50/50 min-h-screen relative overflow-hidden">
            {/* Background Sparkles & Grid Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <SparklesComp
                    density={60}
                    direction="bottom"
                    speed={0.3}
                    color="#15cb98"
                    className="absolute inset-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_80%)]"
                />
            </div>

            <Container className="relative z-10 max-w-4xl">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/branding" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors group">
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Voltar para a página anterior
                    </Link>
                </div>

                {/* Header text */}
                <div className="text-center md:text-left mb-12">
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-black mb-4">
                        Formulário de Solicitação de <span className="text-brand font-bold italic">Branding</span>
                    </h1>
                    <p className="text-gray-500 font-light max-w-xl">
                        Conte-nos um pouco sobre a sua história e objetivos para que possamos desenhar a identidade perfeita para a sua gastronomia.
                    </p>
                </div>

                {/* Form Wrapper */}
                <div 
                    onMouseMove={handleMouseMove}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-10 relative group hover:border-gray-200 transition-all duration-300 overflow-visible"
                >
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 overflow-hidden rounded-2xl"
                        style={{
                            background: "radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(21, 203, 152, 0.03), transparent 80%)"
                        }}
                    />

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                        
                        {/* Selected Plan Premium Callout */}
                        <div className="bg-brand/5 border border-brand/20 p-5 rounded-2xl animate-in fade-in duration-300">
                            <span className="text-xs font-semibold text-brand-dark block mb-1">
                                Plano de interesse selecionado
                            </span>
                            <h4 className="text-lg font-normal text-gray-900 font-sans">
                                {selectedPlan}
                            </h4>
                            <p className="text-xs text-gray-500 font-light mt-0.5">
                                {PLAN_OPTIONS.find(p => p.value === selectedPlan)?.desc || "Preencha o formulário para receber a nossa proposta."}
                            </p>
                        </div>

                        {/* SECTION 1: Personal & Store Data */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <div className="p-1.5 bg-brand/10 text-brand rounded-lg">
                                    <Store size={18} />
                                </div>
                                <h3 className="font-medium text-gray-900">1. Dados e Contato</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Seu Nome Completo *"
                                    placeholder="Digite seu nome completo"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                                    }}
                                    error={errors.name}
                                    icon={<User size={16} />}
                                />
                                <Input
                                    label="Nome da sua Loja/Restaurante *"
                                    placeholder="Ex: Burger Vink, Pizzaria do Chefe"
                                    value={storeName}
                                    onChange={(e) => {
                                        setStoreName(e.target.value);
                                        if (errors.storeName) setErrors(prev => ({ ...prev, storeName: "" }));
                                    }}
                                    error={errors.storeName}
                                    icon={<Store size={16} />}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        label="E-mail de Contato *"
                                        type="email"
                                        placeholder="seuemail@exemplo.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                        }}
                                        error={errors.email}
                                        icon={<Mail size={16} />}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="CNPJ (opcional)"
                                        placeholder="00.000.000/0001-00"
                                        value={cnpj}
                                        onChange={handleCnpjChange}
                                        icon={<FileText size={16} />}
                                    />
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="WhatsApp *"
                                    placeholder="(31) 98988-0161"
                                    value={whatsapp}
                                    onChange={handleWhatsappChange}
                                    error={errors.whatsapp}
                                    hint="Será o nosso principal canal de contato estratégico."
                                    icon={<Phone size={16} />}
                                />
                            </div>
                        </div>

                        {/* SECTION 2: Business details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <div className="p-1.5 bg-brand/10 text-brand rounded-lg">
                                    <ShoppingBag size={18} />
                                </div>
                                <h3 className="font-medium text-gray-900">2. Sobre o seu Negócio</h3>
                            </div>

                            {/* Niche Choice */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Nicho de atuação *</label>
                                <div className="relative">
                                    <select
                                        value={niche}
                                        onChange={(e) => {
                                            setNiche(e.target.value);
                                            if (errors.niche) setErrors(prev => ({ ...prev, niche: "" }));
                                        }}
                                        className="appearance-none flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm text-gray-700 font-light focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all cursor-pointer animate-in fade-in-50"
                                    >
                                        <option value="" disabled>Selecione o seu nicho de atuação</option>
                                        {NICHE_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                {errors.niche && <p className="text-sm text-red-500 mt-1">{errors.niche}</p>}
                                
                                {niche === "Outro" && (
                                    <div className="pt-2 animate-in fade-in-50 duration-200">
                                        <Input
                                            placeholder="Digite qual é o seu nicho *"
                                            value={customNiche}
                                            onChange={(e) => {
                                                setCustomNiche(e.target.value);
                                                if (errors.customNiche) setErrors(prev => ({ ...prev, customNiche: "" }));
                                            }}
                                            error={errors.customNiche}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Orders Per Day */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Quantidade de pedidos por dia *
                                </label>
                                <div className="relative">
                                    <select
                                        value={ordersPerDay}
                                        onChange={(e) => {
                                            setOrdersPerDay(e.target.value);
                                            if (errors.ordersPerDay) setErrors(prev => ({ ...prev, ordersPerDay: "" }));
                                        }}
                                        className="appearance-none flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm text-gray-700 font-light focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Selecione a quantidade de pedidos</option>
                                        <option value="Ainda não inaugurei">Ainda não inaugurei</option>
                                        <option value="Até 10 pedidos/dia">Até 10 pedidos por dia</option>
                                        <option value="10 a 50 pedidos/dia">10 a 50 pedidos por dia</option>
                                        <option value="50 a 100 pedidos/dia">50 a 100 pedidos por dia</option>
                                        <option value="Acima de 100 pedidos/dia">Acima de 100 pedidos por dia</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                {errors.ordersPerDay && <p className="text-sm text-red-500 mt-1">{errors.ordersPerDay}</p>}
                            </div>

                            {/* Monthly Revenue Choice */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Qual seu faturamento mensal atual? *
                                </label>
                                <div className="relative">
                                    <select
                                        value={monthlyRevenue}
                                        onChange={(e) => {
                                            setMonthlyRevenue(e.target.value);
                                            if (errors.monthlyRevenue) setErrors(prev => ({ ...prev, monthlyRevenue: "" }));
                                        }}
                                        className="appearance-none flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm text-gray-700 font-light focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Selecione a sua faixa de faturamento</option>
                                        {REVENUE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                {errors.monthlyRevenue && <p className="text-sm text-red-500 mt-1">{errors.monthlyRevenue}</p>}
                            </div>
                        </div>

                        {/* SECTION 3: Brand details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <div className="p-1.5 bg-brand/10 text-brand rounded-lg">
                                    <MessageSquare size={18} />
                                </div>
                                <h3 className="font-medium text-gray-900">3. Detalhes da Marca</h3>
                            </div>

                            {/* Brand details */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-gray-400" />
                                    Conte um pouco mais sobre a sua marca
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Conte-nos sobre a história da sua marca, o que vende, quem é seu principal público e quais são seus sonhos para ela."
                                    value={brandDetails}
                                    onChange={(e) => setBrandDetails(e.target.value)}
                                    className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50 transition-all font-light"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full py-6 rounded-xl font-semibold shadow-lg shadow-brand/10 transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Processando solicitação...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Enviar Solicitação de Plano
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </Button>
                            
                            <p className="text-center text-xs text-gray-400 font-light mt-4">
                                Garantimos sigilo e segurança dos dados fornecidos.
                            </p>
                        </div>

                    </form>
                </div>
            </Container>
        </section>
    );
}
