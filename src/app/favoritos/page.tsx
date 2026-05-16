"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ProductCard } from "@/components/shop/ProductCard";

export default function FavoritesPage() {
    const { favorites, removeFromFavorites } = useFavorites();

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 hidden md:flex items-center justify-center">
                <Container className="flex items-center gap-4">
                    <Link href="/perfil" className="text-gray-500 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center pr-8">Meus Favoritos</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-4xl mx-auto">
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                id={product.id}
                                title={product.title}
                                price={Number(product.price)}
                                unit={product.unit}
                                description={product.category || ""}
                                image={product.image}
                                priceBreakdowns={product.priceBreakdowns}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-gray-900 font-semibold mb-2">Sua lista está vazia</h3>
                        <p className="text-gray-500 text-sm mb-6">Salve os produtos que você mais gosta aqui.</p>
                        <Link href="/" className="bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3 px-6 rounded-full hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-colors">
                            Ver Produtos
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
}
