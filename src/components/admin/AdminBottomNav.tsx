"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderOpen, Package, Image, Tag } from "lucide-react";

export function AdminBottomNav() {
    const pathname = usePathname();

    const menuItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Produtos", href: "/admin/produtos", icon: ShoppingBag },
        { label: "Pedidos", href: "/admin/pedidos", icon: Package },
        { label: "Categorias", href: "/admin/categorias", icon: FolderOpen },
        { label: "Cupons", href: "/admin/cupons", icon: Tag },
        { label: "Config", href: "/admin/configuracao/home", icon: Image },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden block pb-safe">
            <div className="flex justify-around items-center h-16">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 relative
                                ${isActive ? "text-brand" : "text-gray-400 hover:text-gray-600"}
                            `}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
