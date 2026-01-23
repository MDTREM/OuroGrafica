import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ChevronRight, User, Package, Heart, Headphones, FileText, LogOut, Menu as MenuIcon, Printer, Wrench, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MenuPage() {
    const { user, signOut } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
            if (data) {
                // Filter top-level
                setCategories(data.filter((c: any) => !c.parentId && c.showOnHome !== false));
            }
        }
        fetchCategories();
    }, []);

    const accountItems = [
        { icon: Search, label: "Rastrear Pedido", href: "/rastreio" },
        { icon: Headphones, label: "Central de Atendimento", href: "/atendimento" },
        { icon: Package, label: "Meus Pedidos", href: "/perfil/pedidos" },
        { icon: Heart, label: "Favoritos", href: "/favoritos" },
    ];

    const whatsappLink = (service: string) =>
        `https://wa.me/5531982190935?text=${encodeURIComponent(`Olá, quero fazer um orçamento para ${service}`)}`;


    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-center">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MenuIcon size={20} className="text-brand" />
                    Menu
                </h1>
            </div>

            <Container className="pt-6">
                {/* 1. Login/Register Section */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-gray-400">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div>
                            {user ? (
                                <>
                                    <p className="text-sm text-gray-500 font-medium">Olá, {user.user_metadata?.name || user.email?.split('@')[0]}</p>
                                    <Link href="/perfil" className="text-brand font-bold text-sm hover:underline">Minha Conta</Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 font-medium">Olá, Visitante</p>
                                    <Link href="/login" className="text-brand font-bold text-sm hover:underline">Entrar / Cadastro</Link>
                                </>
                            )}
                        </div>
                    </div>
                    {user && <Link href="/perfil"><ChevronRight size={20} className="text-gray-300" /></Link>}
                </div>

                {/* 2. Account Links */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6">
                    {accountItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${idx !== accountItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                                <Icon size={18} className="text-gray-400" />
                                <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* 3. Categories */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 pl-2">Nossas Categorias</h2>
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        {categories.map((cat, idx) => (
                            <Link
                                key={cat.id}
                                href={cat.parentId ? `/categoria/${cat.parentId}/${cat.id}` : `/categoria/${cat.id}`}
                                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== categories.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                                <span className="text-gray-700 font-medium text-sm">{cat.name}</span>
                                <ChevronRight size={16} className="text-gray-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4. Services (Internal Links) */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 pl-2">Serviços Técnicos</h2>
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <Link
                            href="/servicos/outsourcing"
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                            <Printer size={18} className="text-brand" />
                            <span className="text-gray-700 font-medium text-sm">Aluguel de impressoras</span>
                        </Link>
                        <Link
                            href="/servicos/manutencao"
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                            <Wrench size={18} className="text-brand" />
                            <span className="text-gray-700 font-medium text-sm">Conserto de impressoras</span>
                        </Link>
                    </div>
                </div>

                {/* 5. Policies & Logout */}
                <div className="space-y-3">
                    <Link href="/termos-de-uso" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 text-sm font-medium text-gray-600">
                        <FileText size={18} className="text-gray-400" />
                        Políticas e Termos
                    </Link>
                    {user && (
                        <button
                            onClick={async () => {
                                await signOut();
                            }}
                            className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-colors text-sm font-medium text-gray-600 text-left"
                        >
                            <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                            Sair da conta
                        </button>
                    )}
                </div>

                <div className="mt-8 text-center pb-8">
                    <p className="text-xs text-gray-400">Ouro Gráfica © 2024</p>
                </div>

            </Container>
        </div>
    );
}
