"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    unit?: string;
    description: string;
    image?: string;
    priceBreakdowns?: { [quantity: number]: number };
}

export function ProductCard({ id, title, price, unit, description, image, priceBreakdowns }: ProductCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = isFavorite(id);

    const [imgError, setImgError] = useState(false);

    // Calculate lowest total price and corresponding quantity if breakdowns exist
    let displayPrice = Number(price) || 0;
    let displayQty: number | string = unit || "unid";

    if (priceBreakdowns && Object.keys(priceBreakdowns).length > 0) {
        const entries = Object.entries(priceBreakdowns).map(([qty, total]) => ({
            qty: parseInt(qty),
            total: Number(total)
        }));
        
        // Find entry with lowest price
        const lowestTotal = entries.sort((a, b) => a.total - b.total)[0];
        
        // If base price is 0 or higher than the lowest breakdown, use breakdown
        if (displayPrice === 0 || displayPrice > lowestTotal.total) {
            displayPrice = lowestTotal.total;
            displayQty = `${lowestTotal.qty}unid`;
        }
    }

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ 
            id, 
            title, 
            price: displayPrice, 
            unit: String(displayQty), 
            image,
            priceBreakdowns
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="group relative bg-white rounded-xl shadow-xs hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col overflow-visible"
        >
            {/* Spotlight Dynamic Shine Tracker */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 overflow-hidden rounded-xl"
                style={{
                    background: "radial-gradient(320px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(21, 203, 152, 0.08), transparent 80%)"
                }}
            />

            {/* Favorites Button */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 z-30 p-2 rounded-full transition-all shadow-xs ${isFav ? "bg-red-50 text-red-500" : "bg-white/80 backdrop-blur text-gray-400 hover:text-red-500 hover:bg-white"}`}
            >
                <Heart size={18} className={isFav ? "fill-current" : ""} />
            </button>

            {/* Image Area */}
            <div className="relative w-full overflow-hidden bg-gray-50 rounded-t-xl z-10" style={{ paddingBottom: '100%' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    {image && !imgError ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            onError={() => setImgError(true)}
                            className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <div className="p-3 bg-white rounded-full mb-2 shadow-xs">
                                <span className="text-xl font-semibold">V</span>
                            </div>
                            <span className="text-xs">Sem Imagem</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 relative z-10">
                <h3 className="font-semibold text-gray-900 leading-tight mb-1 group-hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors line-clamp-2 text-base">
                    {title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {description}
                </p>

                <div className="mt-auto">
                    <span className="text-[10px] text-gray-400 block uppercase font-medium tracking-wider">A partir de</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-brand">{formatPrice(displayPrice)}</span>
                        <span className="text-xs text-gray-500">/{displayQty}</span>
                    </div>
                </div>
            </div>

            {/* Whole card is clickable */}
            <Link href={`/produto/${id}`} className="absolute inset-0 z-20">
                <span className="sr-only">Ver detalhes de {title}</span>
            </Link>
        </div>
    );
}
