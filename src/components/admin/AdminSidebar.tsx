"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderOpen, Package, Image, Home, LogOut, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const menuItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Produtos", href: "/admin/produtos", icon: ShoppingBag },
        { label: "Categorias", href: "/admin/categorias", icon: FolderOpen },
        { label: "Pedidos", href: "/admin/pedidos", icon: Package },
        { label: "Cupons", href: "/admin/cupons", icon: Tag },
        { label: "Config. Home", href: "/admin/configuracao/home", icon: Image },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-100">
                <Link href="/admin" className="flex items-center gap-2">
                    <img src="https://i.imgur.com/B9Cg1wQ.png" alt="Ouro Gráfica Admin" className="h-8 w-auto object-contain" />
                    <span className="text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full">ADMIN</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? "bg-brand text-white shadow-lg shadow-brand/20"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Icon size={18} className={isActive ? "text-white" : "text-brand"} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <Home size={18} />
                    Ver Loja
                </Link>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
