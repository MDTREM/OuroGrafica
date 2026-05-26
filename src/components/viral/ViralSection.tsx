"use client";

import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Product } from "@/data/mockData";

interface ViralSectionProps {
    title: string;
    preloadedProducts: Product[];
    productViews?: { [productId: string]: string };
}

export function ViralSection({ title, preloadedProducts, productViews }: ViralSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollBy = (offset: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    if (preloadedProducts.length === 0) return null;

    return (
        <section className="bg-[#191919] border-y border-white/5 py-12">
            <Container>
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <h2 className="text-xl font-semibold text-white">
                                {title}
                            </h2>
                        </div>
                        <p className="text-xs text-gray-400">
                            Embalagens que mais geraram conteúdo espontâneo nas redes sociais dos nossos clientes.
                        </p>
                    </div>

                    {/* Carousel Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => scrollBy(-300)}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-colors"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={20} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={() => scrollBy(300)}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:border-white hover:text-white transition-colors"
                            aria-label="Próximo"
                        >
                            <ChevronRight size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Scroll Container */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 no-scrollbar"
                    >
                        {preloadedProducts.map((product) => (
                            <div key={product.id} className="w-[280px] md:w-[240px] flex-none snap-start relative">
                                {/* Views Badge */}
                                {productViews?.[product.id] && (
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
                                        <Eye size={10} />
                                        <span>{productViews[product.id]}</span>
                                    </div>
                                )}
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
