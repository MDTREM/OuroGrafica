"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronRight, Star, Headphones, Heart, FileText, LogOut } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Banner } from "@/components/ui/banner";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";


export function TopBar() {
    const [query, setQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { items } = useCart();

    const isLandingPage = pathname === "/branding";
    const logoUrl = isLandingPage ? "/logo-branding.png" : "/logo.png";
 
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
            if (data) {
                setCategories(data.filter((c: any) => !c.parentId && c.showOnHome !== false));
            }
        }
        fetchCategories();
    }, []);
 
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
            {/* Top Black Bar - Hide on Mobile with Green Flow Effect */}
            <Banner
                variant="rainbow"
                changeLayout={false}
                height="auto"
                rainbowColors={[
                    "rgba(21, 203, 152, 0.45)",
                    "rgba(21, 203, 152, 0.2)",
                    "transparent",
                    "rgba(21, 203, 152, 0.55)",
                    "transparent",
                    "rgba(21, 203, 152, 0.25)",
                    "transparent",
                ]}
                className="hidden md:flex bg-[#191919] text-white text-sm py-2 border-none relative z-40 w-full justify-between items-center"
            >
                <Container className="flex justify-between items-center w-full relative z-10">
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
            </Banner>
            
            {/* Main Header (White) */}
            <header className="bg-white md:sticky md:top-0 z-50 border-b border-gray-100 transition-all duration-300">
                <Container className="h-16 md:h-[84px] flex items-center justify-between gap-4 py-0 relative">
                    
                    {/* LEFT: Menu & Logo */}
                    <div className={cn(
                        "flex items-center gap-3 w-full md:w-auto",
                        isLandingPage ? "relative justify-center md:justify-start" : ""
                    )}>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={cn(
                                "md:hidden p-2 -ml-2 text-gray-700 hover:text-brand transition-colors",
                                isLandingPage ? "absolute left-0 z-10" : ""
                            )}
                        >
                            <Menu size={24} />
                        </button>
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

            {/* Mobile Side Drawer Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop with low opacity */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-[1px]"
                        />

                        {/* Slide-out Drawer starting on left */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[80vw] max-w-[320px] bg-gray-50 z-[100] shadow-2xl flex flex-col md:hidden"
                        >
                            {/* Drawer Header */}
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Menu size={18} className="text-brand" />
                                    Menu Vink
                                </h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="p-4 flex flex-col gap-5 pb-12 flex-1 overflow-y-auto no-scrollbar">
                                {/* 1. User Account Header */}
                                <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                            {user?.user_metadata?.avatar_url ? (
                                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div>
                                            {user ? (
                                                <>
                                                    <p className="text-xs text-gray-500 font-medium">Olá, {user.user_metadata?.name || user.email?.split('@')[0]}</p>
                                                    <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="text-brand font-semibold text-xs hover:underline">Minha Conta</Link>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-gray-500 font-medium">Olá, Visitante</p>
                                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-brand font-semibold text-xs hover:underline">Entrar / Cadastro</Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {user && <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)}><ChevronRight size={18} className="text-gray-300" /></Link>}
                                </div>

                                {/* 2. Core Links */}
                                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                                    <Link
                                        href="/atendimento"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                    >
                                        <Headphones size={16} className="text-gray-400" />
                                        <span className="text-gray-700 font-medium text-xs">Atendimento</span>
                                    </Link>
                                    <Link
                                        href="/favoritos"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors"
                                    >
                                        <Heart size={16} className="text-gray-400" />
                                        <span className="text-gray-700 font-medium text-xs">Favoritos</span>
                                    </Link>
                                </div>

                                {/* 3. Categories */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Categorias</h3>
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col max-h-[220px] overflow-y-auto no-scrollbar">
                                        {categories.map((cat, idx) => (
                                            <Link
                                                key={cat.id}
                                                href={cat.parentId ? `/categoria/${cat.parentId}/${cat.id}` : `/categoria/${cat.id}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${idx !== categories.length - 1 ? 'border-b border-gray-50' : ''}`}
                                            >
                                                <span className="text-gray-700 font-medium text-xs">{cat.name}</span>
                                                <ChevronRight size={14} className="text-gray-300" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* 4. Branding (Agência Vink) */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Agência Vink</h3>
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-3">
                                        <Link
                                            href="/branding"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors"
                                        >
                                            <Star size={16} className="text-brand" />
                                            <span className="text-gray-700 font-medium text-xs">Serviços de Branding</span>
                                        </Link>
                                    </div>

                                </div>

                                {/* 5. Políticas & Sign Out */}
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Legal</h3>
                                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                                            <Link
                                                href="/termos-de-uso"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                            >
                                                <FileText size={16} className="text-gray-400" />
                                                <span className="text-gray-700 font-medium text-xs">Termos de Uso</span>
                                            </Link>
                                            <Link
                                                href="/politica-de-privacidade"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                            >
                                                <FileText size={16} className="text-gray-400" />
                                                <span className="text-gray-700 font-medium text-xs">Política de Privacidade</span>
                                            </Link>
                                            <Link
                                                href="/politica-de-cookies"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors"
                                            >
                                                <FileText size={16} className="text-gray-400" />
                                                <span className="text-gray-700 font-medium text-xs">Política de Cookies</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {user && (
                                        <div>
                                            <button
                                                onClick={async () => {
                                                    await signOut();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-colors text-xs font-medium text-gray-600 text-left shadow-sm"
                                            >
                                                <LogOut size={16} className="text-gray-400" />
                                                Sair da conta
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
