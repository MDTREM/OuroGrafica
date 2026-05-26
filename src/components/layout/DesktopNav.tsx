"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useAdmin } from "@/contexts/AdminContext";
import { ChevronRight, ArrowRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/data/mockData";

export function DesktopNav() {
    const { categories, products } = useAdmin();

    const topLevelCategories = categories
        .filter(cat => !cat.parentId && cat.showOnMenu !== false)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    // States for hovered category and subcategory
    const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
    const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);

    const activeParentId = hoveredParentId || topLevelCategories[0]?.id;
    const activeParent = categories.find(c => c.id === activeParentId);

    const subcategories = categories.filter(sub => sub.parentId === activeParentId);
    
    // Default to first subcategory when parent changes
    const activeSubId = hoveredSubId || subcategories[0]?.id || null;
    const activeSub = categories.find(c => c.id === activeSubId);

    // Helpers to filter products by category/subcategory robustly
    const getProductsForCategory = (catId: string, catName: string) => {
        return products.filter(p => {
            const pCat = p.category?.toLowerCase();
            return pCat === catId.toLowerCase() || pCat === catName.toLowerCase();
        });
    };

    const getProductsForSubcategory = (subId: string, subName: string) => {
        return products.filter(p => {
            const pSub = p.subcategory?.toLowerCase();
            return pSub === subId.toLowerCase() || pSub === subName.toLowerCase();
        });
    };

    // Determine which products to show
    let displayedProducts: Product[] = [];
    let productsTitle = "";
    let viewAllHref = "";

    if (activeParent) {
        if (subcategories.length > 0) {
            if (activeSub) {
                displayedProducts = getProductsForSubcategory(activeSub.id, activeSub.name);
                productsTitle = activeSub.name;
                viewAllHref = `/categoria/${activeParent.id}/${activeSub.id}`;
            }
        } else {
            displayedProducts = getProductsForCategory(activeParent.id, activeParent.name);
            productsTitle = activeParent.name;
            viewAllHref = `/categoria/${activeParent.id}`;
        }
    }

    // Limit displayed products to 6 for a clean, balanced layout
    const limitedProducts = displayedProducts.slice(0, 6);

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    return (
        <div className="hidden md:block bg-white border-b border-gray-200 relative z-30">
            <Container className="flex items-center h-[54px] justify-between">
                
                <div className="flex items-center h-full">
                    {/* All Products Dropdown Trigger */}
                    <div className="group relative h-full flex items-center cursor-pointer mr-8">
                        <div className="flex items-center gap-1.5 text-[14px] font-medium text-gray-900 hover:text-[#15cb98] transition-colors py-4">
                            <Menu size={16} />
                            Todos os Produtos
                        </div>

                        {/* Mega Menu Dropdown Panel */}
                        <div className="absolute top-full left-0 w-[960px] bg-white shadow-2xl border border-gray-150 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex overflow-hidden h-[480px]">
                            
                            {/* Column 1: Parent Categories */}
                            <div className="w-[240px] bg-gray-50/50 py-4 border-r border-gray-100 flex flex-col h-full overflow-y-auto no-scrollbar">
                                <span className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Categorias
                                </span>
                                {topLevelCategories.map((cat) => {
                                    const isHovered = cat.id === activeParentId;
                                    return (
                                        <div
                                            key={cat.id}
                                            onMouseEnter={() => {
                                                setHoveredParentId(cat.id);
                                                setHoveredSubId(null); // Reset subcategory when changing parent
                                            }}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium cursor-pointer transition-all flex items-center justify-between border-l-2",
                                                isHovered
                                                    ? "bg-white text-[#15cb98] border-[#15cb98] font-semibold"
                                                    : "border-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                            )}
                                        >
                                            <span>{cat.name}</span>
                                            {(isHovered || categories.some(sub => sub.parentId === cat.id)) && (
                                                <ChevronRight size={14} className={isHovered ? "text-[#15cb98]" : "text-gray-400"} />
                                            )}
                                        </div>
                                    );
                                })}
                                <Link
                                    href="/categorias"
                                    className="px-4 py-4 text-xs font-semibold text-[#15cb98] hover:text-[#10a379] hover:bg-white border-t border-gray-100 mt-auto flex items-center gap-1.5"
                                >
                                    Ver todas as categorias <ArrowRight size={12} />
                                </Link>
                            </div>

                            {/* Column 2: Subcategories (Conditional) */}
                            {subcategories.length > 0 && (
                                <div className="w-[240px] bg-white py-4 border-r border-gray-100 flex flex-col h-full overflow-y-auto no-scrollbar animate-in fade-in duration-200">
                                    <span className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        Subcategorias
                                    </span>
                                    {subcategories.map((sub) => {
                                        const isHovered = sub.id === activeSubId;
                                        return (
                                            <div
                                                key={sub.id}
                                                onMouseEnter={() => setHoveredSubId(sub.id)}
                                                className={cn(
                                                    "px-4 py-2.5 text-sm font-medium cursor-pointer transition-all flex items-center justify-between border-l-2",
                                                    isHovered
                                                        ? "bg-gray-50/50 text-[#15cb98] border-[#15cb98] font-semibold"
                                                        : "border-transparent text-gray-500 hover:bg-gray-50/30 hover:text-gray-800"
                                                )}
                                            >
                                                <span>{sub.name}</span>
                                                {isHovered && <ChevronRight size={14} className="text-[#15cb98]" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Column 3: Products Grid */}
                            <div className="flex-1 bg-white p-6 flex flex-col h-full overflow-y-auto no-scrollbar">
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        Produtos em {productsTitle}
                                    </span>
                                    {viewAllHref && (
                                        <Link
                                            href={viewAllHref}
                                            className="text-xs font-semibold text-[#15cb98] hover:text-[#10a379] hover:underline flex items-center gap-1"
                                        >
                                            Ver tudo <ArrowRight size={12} />
                                        </Link>
                                    )}
                                </div>

                                {limitedProducts.length > 0 ? (
                                    <div className={cn(
                                        "grid gap-4",
                                        subcategories.length > 0 ? "grid-cols-2" : "grid-cols-3"
                                    )}>
                                        {limitedProducts.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/produto/${product.id}`}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all group/prod"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100 relative">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-gray-50">
                                                            Sem foto
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-semibold text-gray-800 group-hover/prod:text-[#15cb98] transition-colors truncate">
                                                        {product.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                        A partir de <span className="text-[#10a379] font-bold">{formatPrice(product.price)}</span>
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 my-auto">
                                        <p className="text-sm font-medium text-gray-500">
                                            Nenhum produto cadastrado
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Adicione produtos nesta categoria para exibi-los aqui.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Links */}
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {topLevelCategories
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
                    className="h-full flex items-center justify-center px-10 bg-brand text-white font-medium text-[14px] whitespace-nowrap transition-all relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]"
                >
                    <span className="relative z-10">Branding</span>
                </Link>

            </Container>
        </div>
    );
}
