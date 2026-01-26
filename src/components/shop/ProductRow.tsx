"use client";

import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {link && (
                    <Link href={link} className="text-sm font-medium text-brand hover:underline flex items-center gap-1">
                        Ver tudo <ArrowRight size={14} />
                    </Link>
                )}
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 no-scrollbar"
            >
                {displayProducts.map((product) => (
                    <div key={product.id} className="w-[160px] md:w-[240px] flex-none snap-start">
                        <ProductCard {...product} />
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="flexjustify-center gap-2 mt-2">
                <div className="flex items-center justify-center gap-1.5 mx-auto">
                    {displayProducts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToIndex(idx)}
                            className={`transition-all duration-300 rounded-full h-2 ${idx === activeIndex
                                    ? "w-6 bg-brand"
                                    : "w-2 bg-gray-200 hover:bg-gray-300"
                                }`}
                            aria-label={`Ir para item ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </Container>
    );
}
