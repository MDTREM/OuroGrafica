"use client";

import { Container } from "@/components/ui/Container";
import { Check, Printer, Settings, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";

// Types
interface PrinterModel {
    id: string;
    name: string;
    model: string;
    description: string;
    image_url: string;
    specs: {
        speed?: string;
        features?: string[];
    };
}

interface RentalSettings {
    banner_title: string;
    banner_subtitle: string;
    banner_url: string;
}

export default function AluguelPage() {
    const [printers, setPrinters] = useState<PrinterModel[]>([]);
    const [settings, setSettings] = useState<RentalSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Settings
                const { data: settingsData } = await supabase
                    .from('rental_settings')
                    .select('*')
                    .single();

                if (settingsData) setSettings(settingsData);

                // Fetch Printers
                const { data: printersData } = await supabase
                    .from('rental_printers')
                    .select('*')
                    .eq('is_active', true);

                if (printersData) setPrinters(printersData);

            } catch (error) {
                console.error("Error loading rental data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Use only real data
    const displayPrinters = printers;

    const displaySettings = settings || {
        banner_title: "Locação de Impressoras",
        banner_subtitle: "Reduza custos e aumente a produtividade da sua empresa com equipamentos de ponta.",
        banner_url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=2070"
    };

    return (
        <div className="bg-white pb-20 pt-6">
            {/* 1. HERO BANNER - Maintenance Style */}
            <Container>
                <div className="relative h-[200px] md:h-[300px] bg-black overflow-hidden group shadow-lg rounded-lg">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-1000"
                        style={{ backgroundImage: `url(${displaySettings.banner_url})` }}
                    />
                </div>
            </Container>

            {/* 2. BRANDS - Infinite Scroll */}
            <div className="py-10 overflow-hidden bg-white">
                <style jsx>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        animation: scroll 15s linear infinite;
                    }
                `}</style>
                <Container>
                    <div className="flex items-center gap-4 mb-6 justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Marcas Parceiras</h3>
                    </div>

                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        <div className="flex animate-scroll whitespace-nowrap gap-16 items-center">
                            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale opacity-100 transition-all duration-300">
                                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>

            {/* 3. POR QUE ALUGAR */}
            <Container className="py-10">
                <div className="text-left mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Por que alugar?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: "Sem Custo de Compra",
                            desc: "Preserve seu capital de giro. Invista no seu core business enquanto nós cuidamos da infraestrutura.",
                            icon: Zap
                        },
                        {
                            title: "Manutenção Total",
                            desc: "Esqueça chamados técnicos caros. Nossa equipe resolve qualquer problema sem custo adicional.",
                            icon: Settings
                        },
                        {
                            title: "Tinta Inclusa",
                            desc: "Monitoramos o nível de suprimentos e repomos automaticamente antes que acabe.",
                            icon: ShieldCheck
                        },
                        {
                            title: "Backup Garantido",
                            desc: "Sua operação não para. Em caso de defeito crítico, substituímos a máquina imediatamente.",
                            icon: Star
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-brand mb-4">
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>

            {/* 4. MODELOS DISPONÍVEIS */}
            <div id="modelos" className="bg-white py-10 border-t border-gray-100">
                <Container>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Modelos Disponíveis</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayPrinters.map((printer) => (
                            <Link href={`/servicos/aluguel/${printer.id}`} key={printer.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer block">
                                <div className="aspect-[4/3] relative bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 group-hover:bg-gray-100 transition-colors">
                                    <img
                                        src={printer.image_url}
                                        alt={printer.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">
                                        Laser Mono
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{printer.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium mb-4">{printer.model}</p>

                                    {/* Specs Pills */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                                            {printer.specs.speed}
                                        </span>
                                        {printer.specs.features?.slice(0, 2).map((feat, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                                                {feat}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="w-full h-12 rounded-lg border-2 border-brand text-brand font-bold flex items-center justify-center hover:bg-brand hover:text-white transition-all duration-300">
                                        Ver Detalhes
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Container>
            </div>
        </div>
    );
}

const BRANDS = [
    { name: 'Epson', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Epson_logo.svg/2560px-Epson_logo.svg.png' },
    { name: 'Canon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canon_logo.svg/2560px-Canon_logo.svg.png' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png' },
    { name: 'Brother', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Brother_logo.svg/2560px-Brother_logo.svg.png' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg' }
];
