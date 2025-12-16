"use client";

import Link from "next/link";
import { Store } from "lucide-react";

export function AdminMobileTopBar() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 lg:hidden px-4 h-16 flex items-center justify-between shadow-sm">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2">
                <img src="https://i.imgur.com/B9Cg1wQ.png" alt="Ouro Gráfica Admin" className="h-8 w-auto object-contain" />
                <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">ADMIN</span>
            </Link>

            {/* Ver Loja */}
            <Link
                href="/"
                className="text-xs font-bold text-brand flex items-center gap-2 hover:bg-brand/5 px-3 py-1.5 rounded-full transition-colors border border-brand/20"
            >
                <Store size={14} />
                Ver Loja
            </Link>
        </div>
    );
}
