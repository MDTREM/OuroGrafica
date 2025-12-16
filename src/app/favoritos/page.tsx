"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function FavoritesPage() {
    const { favorites, removeFromFavorites } = useFavorites();

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30">
                <Container className="flex items-center gap-4">
                    <Link href="/perfil" className="text-gray-500 hover:text-brand transition-colors p-1">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-8">Meus Favoritos</h1>
                </Container>
            </div>

            <Container className="pt-6 max-w-4xl mx-auto">
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                                <div className="aspect-[4/3] bg-gray-100 relative">
                                    <div className="w-full h-full bg-gray-200"> {/* Image placeholder */}
                                        {/* <img src={product.image} className="w-full h-full object-cover" /> */}
                                    </div>
                                    <button
                                        onClick={() => removeFromFavorites(product.id)}
                                        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{product.category}</span>
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
                                    <p className="text-xs text-gray-400 mb-4">{product.unit}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg text-brand">
                                            {typeof product.price === 'number'
                                                ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
                                                : product.price.startsWith('R$') ? product.price : `R$ ${product.price}`
                                            }
                                        </span>
                                        <Button size="sm" className="h-9 px-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-lg flex items-center gap-2">
                                            <ShoppingCart size={16} />
                                            Comprar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-2">Sua lista está vazia</h3>
                        <p className="text-gray-500 text-sm mb-6">Salve os produtos que você mais gosta aqui.</p>
                        <Link href="/" className="bg-brand text-white font-bold py-3 px-6 rounded-full hover:bg-brand/90 transition-colors">
                            Ver Produtos
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
}
