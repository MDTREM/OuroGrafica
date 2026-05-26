"use client";

import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { Product } from "@/data/mockData";
import { useState, useRef, useEffect } from "react";

interface ProductRowProps {
    title: string;
    filter: 'best-sellers' | 'featured' | 'new' | 'custom';
    productIds?: string[];
    link?: string;
    preloadedProducts?: Product[];
}

export function ProductRow({ title, filter, link, productIds, preloadedProducts }: ProductRowProps) {
    const { products } = useAdmin();

    let displayProducts: Product[] = [];

    if (preloadedProducts && preloadedProducts.length > 0) {
        displayProducts = preloadedProducts;
    } else if (productIds && productIds.length > 0) {
        // Manual selection (Client-side fallback)
        displayProducts = products.filter(p => productIds.includes(p.id));
        displayProducts.sort((a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id));
    } else {
        // Fallback to filters (Client-side fallback)
        switch (filter) {
            case 'best-sellers':
                displayProducts = products.filter(p => p.isBestSeller);
                break;
            case 'featured':
                displayProducts = products.filter(p => p.isFeatured);
                break;
            case 'new':
                displayProducts = products.filter(p => p.isNew);
                break;
            default:
                displayProducts = products;
        }
        // Limit to 4 for auto-filters
        displayProducts = displayProducts.slice(0, 4);
    }

    if (displayProducts.length === 0) return null;

    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft } = scrollRef.current;
        // Estimate item width including gap (approximate, refined by actual calculation if needed)
        // Mobile w-160px (160) + gap-4 (16) = 176
        // Desktop w-240px (240) + gap-4 (16) = 256
        // We can dynamically get the first child width
        const firstChild = scrollRef.current.firstElementChild as HTMLElement;
        if (!firstChild) return;
        const itemWidth = firstChild.offsetWidth + 16; // 16 is gap-4

        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveIndex(newIndex);
    };

    const scrollBy = (offset: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    const scrollToIndex = (index: number) => {
        if (!scrollRef.current) return;
        const firstChild = scrollRef.current.firstElementChild as HTMLElement;
        if (!firstChild) return;
        const itemWidth = firstChild.offsetWidth + 16;

        scrollRef.current.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
        });
    };

    return (
        <Container>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                <div className="flex items-center gap-6">
                    {link && (
                        <Link href={link} className="text-sm font-medium text-brand hover:text-brand-dark hover:underline flex items-center gap-1">
                            Ver tudo <ArrowRight size={14} />
                        </Link>
                    )}
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
            </div>

            {/* Scroll Container Wrapper */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 no-scrollbar"
                >
                    {displayProducts.map((product) => (
                        <div key={product.id} className="w-[280px] md:w-[240px] flex-none snap-start">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}
