"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useAdmin } from "@/contexts/AdminContext";

export function DesktopNav() {
    const { categories } = useAdmin();

    return (
        <div className="hidden md:block bg-white border-b border-gray-200 relative z-30">
            <Container className="flex items-center h-[54px] justify-between">
                
                <div className="flex items-center h-full">
                    {/* All Products Dropdown Trigger */}
                    <div className="group relative h-full flex items-center cursor-pointer mr-8">
                        <div className="flex items-center text-[14px] font-medium text-gray-900 hover:text-[#15cb98] transition-colors">
                            Todos os Produtos
                        </div>

                        {/* Mega Menu Dropdown */}
                        <div className="absolute top-full left-0 w-[800px] bg-white shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex overflow-hidden">
                            {/* Sidebar Categories */}
                            <div className="w-1/3 bg-gray-50 py-2 border-r border-gray-100">
                                {categories
                                    .filter(cat => !cat.parentId && cat.showOnMenu !== false) // Filter Top Level
                                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                    .map((cat) => (
                                        <div key={cat.id} className="group/item px-4 py-2 hover:bg-white hover:text-[#15cb98] cursor-pointer flex items-center justify-between text-sm font-medium text-gray-700">
                                            {cat.name}
                                            <span className="hidden group-hover/item:block text-[#15cb98]">›</span>

                                            {/* Subcategories Popover */}
                                            <div className="absolute top-0 left-1/3 w-2/3 h-full bg-white hidden group-hover/item:block p-6 border-l border-gray-100 z-50 overflow-y-auto">
                                                <h3 className="text-[#15cb98] font-medium text-lg mb-4">{cat.name}</h3>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {/* Dynamic Subcategories */}
                                                    {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                                                        <Link key={sub.id} href={`/categoria/${cat.id}/${sub.id}`} className="text-sm text-gray-600 hover:text-[#15cb98] hover:underline block py-1">
                                                            {sub.name}
                                                        </Link>
                                                    ))}

                                                    <Link href={`/categoria/${cat.id}`} className="col-span-2 mt-4 text-xs font-medium text-[#15cb98] uppercase tracking-wider hover:underline block">
                                                        Ver tudo em {cat.name} →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <Link href="/categorias" className="block px-4 py-3 text-sm font-medium text-[#15cb98] hover:bg-white border-t border-gray-100 mt-2">
                                    Ver todos os departamentos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Links */}
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {categories
                            .filter(cat => !cat.parentId && cat.showOnMenu !== false) // Filter Top Level
                            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                            .slice(0, 5)
                            .map((cat) => (
                                <Link key={cat.id} href={`/categoria/${cat.id}`} className="text-[14px] font-medium text-gray-600 hover:text-[#15cb98] transition-colors whitespace-nowrap">
                                    {cat.name}
                                </Link>
                            ))}
                    </nav>
                </div>

                {/* Featured Block on the Far Right */}
                <Link
                    href="/branding"
                    className="h-full flex items-center justify-center px-10 bg-gradient-to-r from-[#15cb98] to-[#45e6be] text-white font-medium text-[14px] whitespace-nowrap hover:opacity-90 transition-opacity"
                >
                    Branding
                </Link>

            </Container>
        </div>
    );
}
