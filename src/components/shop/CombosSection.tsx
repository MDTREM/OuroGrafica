"use client";

import { Container } from "@/components/ui/Container";
import { ComboItem } from "@/actions/homepage-actions";
import { formatPrice } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Add support for variations inside custom ComboItem types in frontend
interface ExtendedComboItem extends ComboItem {
    variations?: {
        name: string;
        options: string[];
    }[];
}

interface CombosSectionProps {
    title?: string;
    combos?: ExtendedComboItem[];
}

export function CombosSection({ title = "Combos Especiais", combos = [] }: CombosSectionProps) {
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
    const [selectedVars, setSelectedVars] = useState<Record<string, Record<string, string>>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-select first variation option for each combo on mount
    useEffect(() => {
        const initialVars: Record<string, Record<string, string>> = {};
        combos.forEach(combo => {
            if (combo.variations && combo.variations.length > 0) {
                initialVars[combo.id] = {};
                combo.variations.forEach(v => {
                    if (v.options && v.options.length > 0) {
                        initialVars[combo.id][v.name] = v.options[0];
                    }
                });
            }
        });
        setSelectedVars(initialVars);
    }, [combos]);

    if (!combos || combos.length === 0) return null;

    const handleWhatsAppClick = (combo: ExtendedComboItem) => {
        const phone = "5531989880161";
        const itemsList = combo.items.map(item => `• ${item}`).join("\n");
        
        // Formulate selected variations list
        const vars = selectedVars[combo.id] || {};
        const varsList = Object.entries(vars)
            .map(([name, val]) => `*${name}:* ${val}`)
            .join("\n");
        
        const text = encodeURIComponent(
            `Olá! Gostaria de saber mais e solicitar o *${combo.title}*\n\n` +
            (varsList ? `*Opções Selecionadas:*\n${varsList}\n\n` : "") +
            `*Valor:* ${formatPrice(combo.price)}\n` +
            `*Itens inclusos:*\n${itemsList}\n\n` +
            `Como podemos dar andamento ao pedido e à criação das artes?`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
    };

    const scrollBy = (offset: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    return (
        <section className="py-12 bg-white">
            <Container>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
                    </div>
                    
                    {/* Carousel Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => scrollBy(-300)}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-colors"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={20} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={() => scrollBy(300)}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-colors"
                            aria-label="Próximo"
                        >
                            <ChevronRight size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Scroll Container Wrapper */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 no-scrollbar"
                    >
                        {combos.map((combo, index) => {
                            const hasImage = combo.image && !imgErrors[combo.id];
                            const originalPrice = combo.originalPrice || combo.price * 1.35;
                            const discountPct = originalPrice > combo.price ? Math.round(((originalPrice - combo.price) / originalPrice) * 100) : 0;

                            return (
                                <div 
                                    key={combo.id} 
                                    className="w-[280px] md:w-[240px] flex-none snap-start first:ml-4 md:first:ml-0"
                                >
                                    <div className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
                                        {/* Image Area - Aspect ratio 3:4, matching cover image specifications */}
                                        <Link href={`/combo/${combo.id}`} className="relative w-full overflow-hidden bg-gray-50 rounded-t-xl block aspect-[3/4]">
                                            {discountPct > 0 && (
                                                <div className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                                    -{discountPct}%
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {hasImage ? (
                                                    <Image
                                                        src={combo.image!}
                                                        alt={combo.title}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                        onError={() => setImgErrors(prev => ({ ...prev, [combo.id]: true }))}
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                        <div className="p-3 bg-white rounded-full mb-2 shadow-sm">
                                                            <span className="text-xl font-semibold">V</span>
                                                        </div>
                                                        <span className="text-[10px]">Sem Imagem</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Content - Left Aligned, No Bold */}
                                        <div className="p-4 flex flex-col flex-1">
                                            {/* Combo Title - smaller, not bold, left-aligned, no subtitle */}
                                            <Link href={`/combo/${combo.id}`} className="block">
                                                <h3 className="font-medium text-gray-900 leading-tight mb-3 group-hover:text-brand transition-colors text-sm text-left">
                                                    {combo.title}
                                                </h3>
                                            </Link>

                                            {/* Items List - Only qty + name */}
                                            <div className="mb-3">
                                                <ul className="space-y-1.5">
                                                    {combo.items.map((item, index) => {
                                                        // Strip parenthetical details: "1000 Cartão de Visita (Formato: X, ...)" → "1000 Cartão de Visita"
                                                        const cleanItem = item.replace(/\s*\(.*\)\s*$/, '');
                                                        return (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <Check size={12} className="text-brand shrink-0 mt-0.5" strokeWidth={3.5} />
                                                                <span className="text-xs text-gray-500 font-normal leading-normal text-left">
                                                                    {cleanItem}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {/* Interactive Variation Selectors directly on card */}
                                            {combo.variations && combo.variations.length > 0 && (
                                                <div className="my-2 border-t border-gray-150/40 pt-2 space-y-2">
                                                    {combo.variations.map((v) => {
                                                        const currentVal = selectedVars[combo.id]?.[v.name] || v.options[0] || "";
                                                        return (
                                                            <div key={v.name} className="flex flex-col gap-1 text-left">
                                                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{v.name}</span>
                                                                <select
                                                                    value={currentVal}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setSelectedVars(prev => ({
                                                                            ...prev,
                                                                            [combo.id]: {
                                                                                ...(prev[combo.id] || {}),
                                                                                [v.name]: val
                                                                            }
                                                                        }));
                                                                    }}
                                                                    className="h-8 px-2 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-650 focus:outline-none focus:border-brand font-normal w-full"
                                                                >
                                                                    {v.options.map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Price - Crossed-out value side-by-side with Real value */}
                                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-baseline gap-2">
                                                <span className="text-base font-medium text-brand leading-none">
                                                    {formatPrice(combo.price)}
                                                </span>
                                                {originalPrice > combo.price && (
                                                    <span className="text-[10px] text-gray-400 line-through font-normal leading-none">
                                                        {formatPrice(originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </section>
    );
}
