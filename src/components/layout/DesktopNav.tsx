"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function DesktopNav() {
    const categories = [
        {
            id: "cartoes",
            name: "Cartões de Visita",
            subcategories: ["Papel Couchê", "PVC Transparente", "Metalizado", "Papel Reciclado"]
        },
        {
            id: "banners",
            name: "Banners",
            subcategories: ["Lona Brilho", "Lona Fosca", "Banner Roll-up", "X-Banner"]
        },
        {
            id: "adesivos",
            name: "Adesivos",
            subcategories: ["Vinil Branco", "Vinil Transparente", "Papel", "Recorte Eletrônico"]
        },
        {
            id: "flyers",
            name: "Flyers e Panfletos",
            subcategories: ["A4", "A5", "A6", "DL (Envelope)"]
        },
        {
            id: "crachas",
            name: "Crachás e Cordões",
            subcategories: ["PVC", "Cordão Personalizado", "Porta Crachá", "Acessórios"]
        },
        {
            id: "pastas",
            name: "Pastas",
            subcategories: ["Com Bolsa", "Sem Bolsa", "Orelha", "Corte Especial"]
        },
        {
            id: "cardapios",
            name: "Cardápios",
            subcategories: ["Plastificado", "PVC Rígido", "Encadernado", "Americano"]
        },
    ];

    return (
        <div className="hidden md:block bg-surface border-b border-border shadow-sm relative z-30">
            <Container className="h-12 flex items-center gap-8">
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
                            {categories.map((cat) => (
                                <div key={cat.id} className="group/item px-4 py-2 hover:bg-white hover:text-brand cursor-pointer flex items-center justify-between text-sm font-medium text-gray-700">
                                    {cat.name}
                                    <span className="hidden group-hover/item:block text-brand">›</span>

                                    {/* Subcategories Popover (Right Side - Positioned relative to main container) */}
                                    <div className="absolute top-0 right-0 w-2/3 h-full bg-white hidden group-hover/item:block p-6 border-l border-gray-100 z-50 overflow-y-auto">
                                        <h3 className="text-brand font-bold text-lg mb-4">{cat.name}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {cat.subcategories.map((sub, idx) => (
                                                <Link key={idx} href={`/categoria/${cat.id}/${sub.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-gray-600 hover:text-brand hover:underline block">
                                                    {sub}
                                                </Link>
                                            ))}
                                            <Link href={`/categoria/${cat.id}`} className="col-span-2 mt-2 text-xs font-bold text-brand uppercase tracking-wider hover:underline">
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
                    {categories.slice(0, 6).map((cat) => (
                        <Link key={cat.id} href={`/categoria/${cat.id}`} className="text-sm font-medium text-gray-600 hover:text-brand transition-colors whitespace-nowrap">
                            {cat.name}
                        </Link>
                    ))}
                    <Link href="/ofertas" className="text-sm font-bold text-brand hover:text-brand-dark transition-colors whitespace-nowrap">
                        Ofertas do Dia
                    </Link>
                </nav>
            </Container>
        </div>
    );
}
