"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Menu, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export function BottomNav() {
    const pathname = usePathname();
    const { items } = useCart();
    // Count logic kept just in case, though cart removed from nav

    // Hide BottomNav on specific pages if needed
    if (pathname.startsWith("/produto/") || pathname === "/carrinho" || pathname === "/checkout") {
        // return null; // User typically wants nav always available unless strictly funnel
    }

    const navItems = [
        { href: "/", label: "Início", icon: Home },
        { href: "/categorias", label: "Produtos", icon: LayoutGrid },
        { href: "/servicos/manutencao", label: "Serviços", icon: Wrench },
        { href: "/menu", label: "Menu", icon: Menu },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border md:hidden block pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 relative",
                                isActive ? "text-brand" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className="relative">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {item.href === "/carrinho" && itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-surface">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
