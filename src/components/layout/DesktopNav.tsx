"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useAdmin } from "@/contexts/AdminContext";

export function DesktopNav() {
    const { categories } = useAdmin();
    // Use categories from context, subcategories logic would need DB update to support
    // For now we map DB categories to the structure expected or simplify
    // Since types might differ, we adapt
    const navCategories = categories.map(c => ({
        id: c.id,
        name: c.name,
        subcategories: [] // No subcategories in DB yet
    }));

    return (
        <div className="hidden md:block bg-surface border-b border-border shadow-sm relative z-30">
            <Container className="h-12 flex items-center gap-8">
                {/* Services Button */}
                <Link
                    href="/servicos"
                    className="flex items-center gap-2 text-sm font-bold text-brand hover:text-white hover:bg-brand transition-colors px-3 py-1.5 bg-orange-50 rounded-md"
                >
                    Serviços
                </Link>

                {/* All Products Dropdown Trigger */}
                <div className="group relative h-full flex items-center cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-brand transition-colors px-3 py-1.5 bg-gray-100 rounded-md">
                        <Menu size={18} />
                        Todos os produtos
                        <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
                    </div>

                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-full left-0 w-[600px] bg-white shadow-2xl border border-gray-100 rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex overflow-hidden">
                        {/* Sidebar Categories */}
                        <div className="w-1/3 bg-gray-50 py-2 border-r border-gray-100">
                            {categories
                                .filter(cat => !cat.parentId && cat.showOnMenu !== false) // Filter Top Level
                                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                .map((cat) => (
                                    <div key={cat.id} className="group/item px-4 py-2 hover:bg-white hover:text-brand cursor-pointer flex items-center justify-between text-sm font-medium text-gray-700">
                                        {cat.name}
                                        <span className="hidden group-hover/item:block text-brand">›</span>

                                        {/* Subcategories Popover */}
                                        <div className="absolute top-0 right-0 w-2/3 h-full bg-white hidden group-hover/item:block p-6 border-l border-gray-100 z-50 overflow-y-auto">
                                            <h3 className="text-brand font-bold text-lg mb-4">{cat.name}</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {/* Dynamic Subcategories */}
                                                {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                                                    <Link key={sub.id} href={`/categoria/${sub.id}`} className="text-sm text-gray-600 hover:text-brand hover:underline block py-1">
                                                        {sub.name}
                                                    </Link>
                                                ))}

                                                {categories.filter(sub => sub.parentId === cat.id).length === 0 && (
                                                    <p className="text-gray-400 text-sm col-span-2">Opções disponíveis no detalhe do produto.</p>
                                                )}

                                                <Link href={`/categoria/${cat.id}`} className="col-span-2 mt-4 text-xs font-bold text-brand uppercase tracking-wider hover:underline block">
                                                    Ver tudo em {cat.name} →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            <Link href="/categorias" className="block px-4 py-3 text-sm font-bold text-brand hover:bg-white border-t border-gray-100 mt-2">
                                Ver todos os departamentos
                            </Link>
                        </div>

                        {/* Default Content (Right Side - Visible when no hover on specific item, technically hidden by overlay but handled by CSS architecture usually, here simpler approach) */}
                        <div className="hidden">
                            {/* Simplification: The sub-menu appears on hover of the left item. 
                                A true complex mega menu would require state to keep the right side persistent.
                                CSS-only 'flyout' is used here via nested grouping.
                            */}
                        </div>
                    </div>
                </div>

                {/* Main Links */}
                <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">

                    {categories
                        .filter(cat => !cat.parentId && cat.showOnMenu !== false) // Filter Top Level
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                        .slice(0, 6)
                        .map((cat) => (
                            <Link key={cat.id} href={`/categoria/${cat.id}`} className="text-sm font-medium text-gray-600 hover:text-brand transition-colors whitespace-nowrap">
                                {cat.name}
                            </Link>
                        ))}

                </nav>
            </Container>
        </div>
    );
}
