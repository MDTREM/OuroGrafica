"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Truck } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn, formatPrice } from "@/lib/utils";
import { ComboItem } from "@/actions/homepage-actions";
import { useCart } from "@/contexts/CartContext";

interface ComboClientProps {
    combo: ComboItem;
}

export default function ComboClient({ combo }: ComboClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({});

    // Initialize variation defaults
    useEffect(() => {
        if (combo && combo.variations) {
            const defaults: { [key: string]: string } = {};
            combo.variations.forEach(v => {
                if (v.options.length > 0) {
                    defaults[v.name] = v.options[0];
                }
            });
            setSelectedVariations(defaults);
        }
    }, [combo]);

    const finalPrice = combo.price;
    const originalPrice = combo.originalPrice || combo.price * 1.35;

    const handleAddToCart = () => {
        if (!combo) return;

        addToCart({
            productId: combo.id,
            title: combo.title,
            subtitle: "Combo Promocional",
            price: finalPrice,
            quantity: 1,
            image: combo.image || "",
            details: {
                paper: selectedVariations["Papel"] || selectedVariations["Material"] || "Padrão Combo",
                finish: selectedVariations["Acabamento"] || "Padrão Combo",
                format: selectedVariations["Formato"] || "Padrão Combo",
                designOption: "upload",
                selectedVariations: selectedVariations
            }
        });

        router.push("/carrinho");
    };

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            <Container className="pt-4 md:pt-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* COLUNA ESQUERDA: IMAGEM E DETALHES (Lg: 8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. IMAGEM DO COMBO */}
                        <div className="space-y-4">
                            <div className="aspect-square md:aspect-[16/10] rounded-xl relative flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                {combo.image ? (
                                    <Image
                                        src={combo.image}
                                        alt={combo.title}
                                        fill
                                        className="object-cover animate-in fade-in zoom-in-95 duration-500"
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        priority
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <span className="text-6xl mb-2">📦</span>
                                        <span className="text-sm font-medium">Sem imagem disponível</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. TÍTULO E DESCRIÇÃO (MOBILE ONLY) */}
                        <div className="lg:hidden space-y-6 px-1">
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">{combo.title}</h1>
                            {combo.subtitle && (
                                <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed text-[13px]">
                                    <p>{combo.subtitle}</p>
                                </div>
                            )}
                        </div>

                        {/* 3. ITENS INCLUSOS */}
                        <section className="space-y-6 pt-6 border-t border-gray-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Itens Inclusos no Combo</h3>
                                <p className="text-xs text-gray-500">Confira todos os materiais que fazem parte deste pacote especial</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {combo.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <div className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0">
                                            <Check size={16} strokeWidth={3} className="text-brand" />
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. SELETORES DE VARIAÇÕES DO COMBO */}
                        {combo.variations && combo.variations.length > 0 && (
                            <div className="space-y-10 pt-10 border-t border-gray-100/60">
                                {combo.variations.map((variation, vIdx) => (
                                    <section key={vIdx} className="space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{variation.name}</h3>
                                            <p className="text-xs text-gray-500">Selecione uma opção de personalização geral</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            {variation.options.map((option, oIdx) => {
                                                const isSelected = selectedVariations[variation.name] === option;
                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.name]: option }))}
                                                        className={cn(
                                                            "group flex flex-col rounded-xl border-2 transition-all p-5 text-left bg-white shadow-sm duration-300 min-h-[90px] justify-between",
                                                            isSelected ? "border-brand bg-brand/5 ring-4 ring-brand/10 shadow-md" : "border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        <p className={cn("text-[13px] font-semibold leading-snug", isSelected ? "text-brand" : "text-gray-700")}>
                                                            {option}
                                                        </p>
                                                        <div className="flex items-center justify-end w-full mt-2">
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                                                isSelected ? "border-brand bg-brand" : "border-gray-200"
                                                            )}>
                                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA: RESUMO E COMPRA (Lg: 4 cols) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        
                        {/* TÍTULO E SUBTÍTULO (DESKTOP ONLY) */}
                        <div className="hidden lg:block space-y-4 mb-4">
                            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{combo.title}</h1>
                            {combo.subtitle && (
                                <p className="text-sm text-gray-500 leading-relaxed">{combo.subtitle}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-8">
                            
                            <div className="space-y-6 pt-2">

                                {/* RESUMO DO PEDIDO E COMPRA */}
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Resumo do Pedido
                                    </h2>
                                    
                                    <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-100/80">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Pacote</span>
                                            <span className="font-semibold text-gray-900">1x Combo Especial</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Preço Base do Combo</span>
                                            <span className="text-gray-400 font-medium">{formatPrice(combo.price)}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200/60 flex justify-between items-end">
                                            <span className="text-gray-500 font-medium mb-0.5 text-xs">Total à vista</span>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 leading-none">{formatPrice(finalPrice)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                                    >
                                        Comprar Combo
                                    </button>
                                </div>
                                
                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            <Check size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Garantia de Qualidade</p>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Reimpressão grátis em caso de erros.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            <Truck size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Prazo de Produção</p>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">O prazo começa a contar após aprovação da arte e confirmação do pagamento.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>


        </div>
    );
}
