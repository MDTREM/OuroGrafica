"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Container } from "@/components/ui/Container";
import { ArrowLeft, Check, Printer, Wifi, Zap, FileText, Smartphone, ShieldCheck, Box, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
}

export default function PrinterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [printer, setPrinter] = useState<Printer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    useEffect(() => {
        async function fetchPrinter() {
            const { data, error } = await supabase
                .from('rental_printers')
                .select('*')
                .eq('id', resolvedParams.id)
                .single();

            if (data) setPrinter(data);
            setIsLoading(false);
        }
        fetchPrinter();
    }, [resolvedParams.id]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div></div>;

    if (!printer) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-xl font-bold">Impressora não encontrada</h1>
            <Link href="/servicos/aluguel" className="text-brand hover:underline">Voltar para lista</Link>
        </div>
    );

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            {/* Nav */}
            {/* Mobile Sticky Header */}
            <div className="sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 h-14 flex items-center justify-between px-4 md:hidden">
                <Link href="/servicos/aluguel" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={22} className="text-gray-700" />
                </Link>
                <h1 className="text-sm font-bold truncate max-w-[200px] text-gray-900">{printer.name}</h1>
                <div className="relative p-2">
                    <Link href="/carrinho">
                        <ShoppingCart size={22} className="text-gray-700" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full"></span>
                    </Link>
                </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block bg-white border-b border-gray-200">
                <Container className="h-16 flex items-center">
                    <Link href="/servicos/aluguel" className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium text-sm">Voltar para Aluguel</span>
                    </Link>
                </Container>
            </div>

            <Container className="pt-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-2xl relative flex items-center justify-center overflow-hidden mb-4 border border-gray-200">
                            {printer.image_url ? (
                                <img src={printer.image_url} alt={printer.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                            ) : (
                                <Printer size={64} className="text-gray-300" />
                            )}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="px-4 md:px-0">
                        <span className="text-brand font-bold text-sm uppercase tracking-wide mb-2 block">{printer.model}</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{printer.name}</h1>

                        {/* Badges/Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {printer.specs.is_wifi && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white">
                                    <Wifi size={14} className="text-blue-500" /> Wi-Fi
                                </span>
                            )}
                            {printer.specs.is_color ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-500 via-green-500 to-red-500" /> Colorida
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-900" /> Mono
                                </span>
                            )}
                            {printer.specs.is_scanner && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 bg-white">
                                    <Box size={14} className="text-orange-500" /> Scanner
                                </span>
                            )}
                        </div>

                        {/* Description with Read More */}
                        <div className="mb-8">
                            <p className={cn(
                                "text-gray-600 leading-relaxed text-sm transition-all duration-300",
                                !isDescExpanded && "line-clamp-2"
                            )}>
                                {printer.description}
                            </p>
                            <button
                                onClick={() => setIsDescExpanded(!isDescExpanded)}
                                className="text-brand font-bold text-xs mt-1 hover:underline focus:outline-none"
                            >
                                {isDescExpanded ? "Ler menos" : "Ler mais"}
                            </button>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {/* Maintenance Card */}
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-4 h-full">
                                <div className="bg-white p-2 rounded-full text-brand shadow-sm mt-1">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">Manutenção Preventiva</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">Monitoramento e reparos sem custo adicional.</p>
                                </div>
                            </div>

                            {/* Installation Card */}
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-4 h-full">
                                <div className="bg-white p-2 rounded-full text-green-600 shadow-sm mt-1">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">Instalação Grátis</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">Configuração completa no seu escritório.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* INFO SECTIONS BELOW */}
                <div className="mt-12 md:mt-16 grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                    {/* Ficha Técnica */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-brand rounded-full"></div>
                            Ficha Técnica
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
                            <SpecItem label="Velocidade" value={printer.specs.speed} />
                            <SpecItem label="Resolução" value={printer.specs.resolution} />
                            <SpecItem label="Conectividade" value={printer.specs.connectivity} />
                            <SpecItem label="Capacidade Papel" value={printer.specs.paper_capacity} />
                            {printer.specs.features && printer.specs.features.map((feat, idx) => (
                                <div key={idx} className="flex justify-between border-b border-gray-100 py-3">
                                    <span className="text-gray-500 font-medium">Recurso Extra</span>
                                    <span className="font-bold text-gray-900">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </Container>

            {/* FIXED BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Container className="max-w-4xl p-0 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-xs text-gray-500 block font-medium mb-0.5">Planos a partir de</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-2xl text-brand">
                                {printer.monthly_price ? `R$ ${printer.monthly_price}` : "Sob Consulta"}
                            </span>
                            {printer.monthly_price && <span className="text-xs text-gray-500 font-bold">/mês</span>}
                        </div>
                    </div>
                    <Link
                        href={printer.available_for_rent
                            ? `https://wa.me/5531999999999?text=Olá, gostaria de um orçamento para alugar a impressora ${printer.name}`
                            : "#"}
                        target={printer.available_for_rent ? "_blank" : "_self"}
                        className={cn(
                            "flex-1 max-w-xs py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-base",
                            printer.available_for_rent
                                ? "bg-brand text-white hover:bg-brand/90 hover:translate-y-[-2px] shadow-brand/20"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        )}
                    >
                        {printer.available_for_rent ? "Solicitar Orçamento" : "Indisponível"}
                    </Link>
                </Container>
            </div>
        </div>
    );
}

function SpecItem({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="flex justify-between border-b border-gray-100 py-3">
            <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">{label}</span>
            <span className="font-bold text-gray-900">{value}</span>
        </div>
    );
}
