"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, MapPin, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { PRODUCTS } from "@/data/mockData";
import { formatPrice } from "@/lib/utils";

export function TopBar() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const router = useRouter();
    const { user, isLoading, signOut, isAdmin } = useAuth();
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
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
            <Container className="h-16 flex items-center justify-between gap-4">
                {/* Brand/Logo */}
                <Link href="/" className="flex items-center gap-2 mr-auto md:mr-8 group shrink-0">
                    <img src="https://i.imgur.com/B9Cg1wQ.png" alt="Ouro Gráfica" className="h-8 md:h-10 w-auto object-contain" />
                </Link>

                {/* Desktop Search */}
                <div className="flex-1 max-w-3xl mx-auto hidden md:block relative group px-8">
                    <form onSubmit={handleSearch} className="relative w-full z-50">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setIsSearching(true);
                                }}
                                onFocus={() => setIsSearching(true)}
                                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                                className="w-full h-12 pl-6 pr-14 rounded-full bg-gray-100 border-none focus:bg-white focus:ring-2 focus:ring-brand/20 text-sm focus:outline-none transition-all text-gray-700 placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 h-10 w-10 bg-brand text-white rounded-full flex items-center justify-center hover:bg-[#e65a00] transition-colors shadow-sm"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Icons: Profile & Cart */}
                <div className="flex items-center justify-end gap-6 ml-auto shrink-0">
                    {/* User Profile - Expanded */}
                    <Link href={user ? "/perfil" : "/login"} className="hidden md:flex items-center gap-3 group text-left">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            <User size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-medium tracking-wide">Bem-vindo(a)</span>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors">
                                {user ? user.user_metadata.full_name?.split(' ')[0] : "Entrar ou Cadastrar"}
                            </span>
                        </div>
                    </Link>

                    {/* Simplified Mobile User Icon */}
                    <Link href={user ? "/perfil" : "/login"} className="md:hidden text-gray-600">
                        <User size={24} />
                    </Link>



                    {/* Divider */}
                    <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                    {/* Cart */}
                    <Link href="/carrinho" className="relative text-gray-600 hover:text-brand transition-colors p-1">
                        <ShoppingCart size={24} />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">{itemCount}</span>
                        )}
                    </Link>
                </div>
            </Container>

            {/* Mobile Search Row (Always Visible) */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="relative w-full">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar produtos, serviços ou manutenção..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsSearching(true);
                            }}
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 border-none text-sm text-gray-800 placeholder:text-gray-500 focus:ring-1 focus:ring-brand"
                        />
                    </div>
                </form>
            </div>
        </header>
    );
}
