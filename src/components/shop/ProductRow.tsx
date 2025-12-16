"use client";

import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface ProductRowProps {
    title: string;
    filter: 'best-sellers' | 'featured' | 'new' | 'custom';
    productIds?: string[];
    link?: string;
}

export function ProductRow({ title, filter, link, productIds }: ProductRowProps) {
    const { products } = useAdmin();

    let displayProducts = [];

    if (productIds && productIds.length > 0) {
        // Manual selection
        displayProducts = products.filter(p => productIds.includes(p.id));
    } else {
        // Fallback to filters
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </Container>
    );
}
