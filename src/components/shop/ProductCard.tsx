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

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ id, title, price, unit, image });
    };

    const [imgError, setImgError] = useState(false);

    return (
        <div className="group relative bg-surface rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Favorites Button */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-sm ${isFav ? "bg-red-50 text-red-500" : "bg-white/80 backdrop-blur text-gray-400 hover:text-red-500 hover:bg-white"
                    }`}
            >
                <Heart size={18} className={isFav ? "fill-current" : ""} />
            </button>

            {/* Image Area */}
            <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden">
                {image && !imgError ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        onError={() => setImgError(true)}
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                        <div className="p-3 bg-white rounded-full mb-2">
                            {/* Using a lucide icon as placeholder if imported, otherwise just text */}
                            <span className="text-xl font-bold">IMG</span>
                        </div>
                        <span className="text-xs">Sem Imagem</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-brand transition-colors line-clamp-2">
                    {title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[2.5em]">
                    {description}
                </p>

                <div className="mt-auto">
                    <div className="mb-0">
                        <div className="mb-0">
                            {(() => {
                                // Check if there is a price breakdown available
                                if (priceBreakdowns && Object.keys(priceBreakdowns).length > 0) {
                                    // Find the lowest price from the breakdown (usually the smallest quantity)
                                    const entries = Object.entries(priceBreakdowns);
                                    if (entries.length > 0) {
                                        // Sort by quantity to find minimal starting entry or just min price? 
                                        // Usually "Starting From" implies lowest price for minimal quantity? 
                                        // Or lowest unit price? Usually "A partir de R$ 29,90" means the cheapest pack.
                                        const minPrice = Math.min(...Object.values(priceBreakdowns).map(Number));

                                        if (minPrice > 0) {
                                            return (
                                                <>
                                                    <span className="text-xl font-bold text-brand block">{formatPrice(minPrice)}</span>
                                                </>
                                            )
                                        }
                                    }
                                }

                                // Fallback to standard price
                                return (
                                    <>
                                        <span className="text-xl font-bold text-brand block">{formatPrice(price)}</span>
                                        {unit && <span className="text-xs text-gray-500 font-medium block">/ {unit}</span>}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <Link href={`/produto/${id}`} className="absolute inset-0 z-0">
                <span className="sr-only">Ver detalhes de {title}</span>
            </Link>
        </div>
    );
}
