"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import { PRODUCTS } from "@/data/mockData";
import { formatPrice } from "@/lib/utils";

export function TopBar() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const router = useRouter();
    const { items } = useCart();

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const filteredProducts = PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to top 5

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(false);
        if (query.trim()) {
            router.push(`/busca?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-surface shadow-sm border-b border-border">
            <Container className="h-16 flex items-center justify-between gap-4">
                {/* Brand/Logo */}
                <Link href="/" className="flex items-center gap-2 mr-4">
                    <img src="https://i.imgur.com/B9Cg1wQ.png" alt="Ouro Gráfica" className="h-8 md:h-10 w-auto object-contain cursor-pointer" />
                </Link>

                {/* Search Bar (Expanded on Desktop, Compact on Mobile) */}
                <div className="flex-1 max-w-xl mx-auto hidden md:block relative group">
                    {/* Search Input Form */}
                    <form onSubmit={handleSearch} className="relative w-full z-50">
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsSearching(true);
                            }}
                            onFocus={() => setIsSearching(true)}
                            // Delay blur to allow clicking on results
                            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                            className="w-full h-10 pl-4 pr-12 rounded-full bg-surface-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all text-foreground placeholder:text-gray-400"
                        />
                        <button type="submit" className="absolute right-1 top-1 h-8 w-8 bg-brand rounded-full text-white flex items-center justify-center hover:bg-brand-dark transition-colors shadow-sm">
                            <Search size={16} />
                        </button>
                    </form>

                    {/* Instant Search Results Dropdown */}
                    {isSearching && query.length > 0 && (
                        <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200">
                            {filteredProducts.length > 0 ? (
                                <ul className="py-2">
                                    {filteredProducts.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={`/produto/${product.id}`}
                                                className="flex items-center gap-4 px-4 py-3 hover:bg-orange-50 transition-colors group/item"
                                                onClick={() => {
                                                    setQuery("");
                                                    setIsSearching(false);
                                                }}
                                            >
                                                <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                                    {/* Use a colored placeholder if no image, or real image */}
                                                    <div className={`w-full h-full ${product.color || "bg-gray-200"}`}></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 group-hover/item:text-brand truncate">{product.title}</h4>
                                                    <p className="text-xs text-gray-500">{product.category}</p>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(product.price)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="border-t border-gray-50 mt-1 pt-1">
                                        <button onClick={handleSearch} className="w-full text-center text-xs font-semibold text-brand hover:underline py-2">
                                            Ver todos os resultados
                                        </button>
                                    </li>
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <p className="text-sm">Nenhum produto encontrado.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Login/Register (Desktop) */}
                <div className="hidden md:flex items-center gap-3 mr-4 lg:mr-8 border-r border-border pr-6">
                    <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-gray-500">
                        <User size={20} />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Bem-vindo(a)</span>
                        <Link href="/login" className="text-sm font-bold text-foreground hover:text-brand transition-colors">
                            Entrar <span className="text-gray-400 font-normal">ou</span> Cadastrar
                        </Link>
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 ml-auto md:ml-0">
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-brand transition-colors"
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                    >
                        <Search size={22} className={showMobileSearch ? "text-brand" : ""} />
                    </button>
                    <Link href="/carrinho" className="relative p-2 text-gray-600 hover:text-brand transition-colors hidden md:block">
                        <ShoppingCart size={22} />
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full">{itemCount}</span>
                        )}
                    </Link>
                </div>
            </Container>

            {/* Mobile Search Bar Expansion */}
            {showMobileSearch && (
                <div className="md:hidden border-t border-gray-100 p-4 bg-white animate-in slide-in-from-top-5 duration-200">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsSearching(true);
                            }}
                            autoFocus
                            className="w-full h-11 pl-4 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-foreground placeholder:text-gray-400"
                        />
                        <button type="submit" className="absolute right-2 top-2 h-7 w-7 bg-brand rounded-lg text-white flex items-center justify-center shadow-sm">
                            <Search size={16} />
                        </button>
                    </form>

                    {/* Instant Search Results Dropdown (Mobile) */}
                    {isSearching && query.length > 0 && (
                        <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            {filteredProducts.length > 0 ? (
                                <ul className="py-2">
                                    {filteredProducts.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={`/produto/${product.id}`}
                                                className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50"
                                                onClick={() => {
                                                    setQuery("");
                                                    setIsSearching(false);
                                                    setShowMobileSearch(false);
                                                }}
                                            >
                                                <div className={`w-10 h-10 rounded-md flex-shrink-0 ${product.color || "bg-gray-200"}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.title}</h4>
                                                    <span className="text-xs font-bold text-brand">{formatPrice(product.price)}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    Nenhum produto encontrado.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
