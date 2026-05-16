"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Don't show on homepage
    if (pathname === "/") return null;

    // Mapping of paths to titles if not provided
    const getTitle = () => {
        if (title) return title;
        
        if (pathname.startsWith("/carrinho")) return "Meu Carrinho";
        if (pathname.startsWith("/checkout")) return "Checkout";
        if (pathname.startsWith("/favoritos")) return "Meus Favoritos";
        if (pathname.startsWith("/perfil")) return "Minha Conta";
        if (pathname.startsWith("/rastreio")) return "Rastrear Pedido";
        if (pathname.startsWith("/blog")) return "Blog Vink";
        if (pathname.startsWith("/categorias")) return "Categorias";
        if (pathname.startsWith("/categoria/")) return "Produtos";
        if (pathname.startsWith("/busca")) return "Busca";
        if (pathname.startsWith("/atendimento")) return "Atendimento";
        if (pathname.startsWith("/politica")) return "Políticas";
        if (pathname.startsWith("/termos")) return "Termos de Uso";
        
        return "Vink";
    };

    return (
        <div className="relative left-0 right-0 z-40 bg-white border-b border-border h-14 flex items-center justify-between px-4 md:hidden">
            <button 
                onClick={() => router.back()} 
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <h1 className="text-sm font-semibold truncate max-w-[200px] text-gray-900">
                {getTitle()}
            </h1>
            <div className="w-10"></div>
        </div>
    );
}
