"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export function TopBar() {
    const [query, setQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const { items } = useCart();

    const isLandingPage = pathname === "/branding";
    const logoUrl = isLandingPage ? "https://i.imgur.com/pDwzTbi.png" : "https://i.imgur.com/aS2efN8.png";
 
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        if (isSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen]);

    const itemCount = items.length;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/busca?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <>
            {/* Top Black Bar - Hide on Mobile */}
            <div className="hidden md:block bg-[#191919] text-white text-sm py-2">
                <Container className="flex justify-between items-center">
                    <div className="flex gap-6">
                        {isLandingPage ? (
                            <Link href="/" className="hover:text-[#15cb98] transition-colors font-medium text-brand">Loja</Link>
                        ) : (
                            <Link href="/branding" className="hover:text-[#15cb98] transition-colors font-medium text-brand">Branding</Link>
                        )}
                        <Link href="/cupons" className="hover:text-[#15cb98] transition-colors font-medium">Cupons</Link>
                        <Link href="/blog" className="hover:text-[#15cb98] transition-colors font-medium">Blog</Link>
                    </div>
                    <div className="font-medium text-xs md:text-sm">
                        Cliente come primeiro com os olhos.
                    </div>
                </Container>
            </div>
            
            {/* Main Header (White) */}
            <header className="bg-white md:sticky md:top-0 z-50 border-b border-gray-100 transition-all duration-300">
                <Container className="h-16 md:h-[84px] flex items-center justify-between gap-4 py-0 relative">
                    
                    {/* LEFT: Menu & Logo */}
                    <div className={cn(
                        "flex items-center gap-3 w-full md:w-auto",
                        isLandingPage ? "relative justify-center md:justify-start" : ""
                    )}>
                        {pathname === "/menu" ? (
                            <button
                                onClick={() => router.back()}
                                className="md:hidden p-2 -ml-2 text-gray-700 hover:text-brand transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                        ) : (
                            <Link
                                href="/menu"
                                className={cn(
                                    "md:hidden p-2 -ml-2 text-gray-700 hover:text-brand transition-colors",
                                    isLandingPage ? "absolute left-0 z-10" : ""
                                )}
                            >
                                <Menu size={24} />
                            </Link>
                        )}
                        <Link
                            href="/"
                            className={cn(
                                "shrink-0 flex items-center h-full",
                                isLandingPage ? "mx-auto md:mx-0" : ""
                            )}
                        >
                            <img src={logoUrl} alt='Vink' className='h-6 md:h-7 w-auto object-contain' />
                        </Link>
                    </div>
 
                    {/* CENTER: Search Bar (Desktop) */}
                    {!isLandingPage && (
                        <div className="flex-1 hidden md:block max-w-5xl">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input
                                    type="text"
                                    placeholder="Qual produto você está procurando?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-[44px] pl-6 pr-14 rounded-full border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1 bottom-1 w-[36px] bg-brand text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                                >
                                    <Search size={16} />
                                </button>
                            </form>
                        </div>
                    )}
 
                    {/* RIGHT: Mobile Search, Profile, Cart */}
                    {!isLandingPage && (
                        <div className="flex items-center gap-1 md:gap-4">
                            {/* Mobile Search Toggle */}
                            <div ref={searchRef} className="md:hidden">
                                <button 
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                        isSearchOpen ? "bg-gray-100 text-gray-700" : "bg-brand text-white"
                                    )}
                                >
                                    {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                                </button>

                                {/* Expanded Mobile Search Dropdown */}
                                {isSearchOpen && (
                                    <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-xl animate-in slide-in-from-top-2 duration-200 z-50">
                                        <form onSubmit={(e) => { handleSearch(e); setIsSearchOpen(false); }} className="relative w-full">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Buscar produtos..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                className="w-full h-[48px] pl-5 pr-12 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand/20 text-sm text-gray-800 focus:outline-none"
                                            />
                                            <button type="submit" className="absolute right-2 top-2 bottom-2 w-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                                <Search size={18} />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <Link href={user ? "/perfil" : "/login"} className="w-10 h-10 md:w-[44px] md:h-[44px] rounded-full md:border md:border-gray-200 flex items-center justify-center text-gray-700 hover:text-brand hover:bg-gray-50 transition-all">
                                <User size={22} />
                            </Link>
     
                            <Link href="/carrinho" className="relative w-10 h-10 md:w-[44px] md:h-[44px] rounded-full md:border md:border-gray-200 flex items-center justify-center text-gray-700 hover:text-brand hover:bg-gray-50 transition-all">
                                <ShoppingCart size={22} />
                                {itemCount > 0 && (
                                    <span className="absolute top-1 right-1 md:-top-1 md:-right-1 w-[18px] h-[18px] md:w-[20px] md:h-[20px] bg-brand text-white text-[9px] md:text-[10px] font-semibold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">{itemCount}</span>
                                )}
                            </Link>
                        </div>
                    )}
                </Container>
            </header>
        </>
    );
}
