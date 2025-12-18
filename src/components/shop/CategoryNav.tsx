"use client";

import { cn } from "@/lib/utils";

import { useAdmin } from "@/contexts/AdminContext";

import Link from "next/link"; // For navigation
import { LayoutGrid, Printer, FileText, Smartphone, PenTool, Image, BookOpen, CreditCard, Tag, Box, Briefcase, Scissors, Coffee, Smile, Star } from "lucide-react";

// Map string icon names to components
const ICON_MAP: Record<string, any> = {
    "LayoutGrid": LayoutGrid,
    "Printer": Printer,
    "FileText": FileText,
    "Smartphone": Smartphone,
    "PenTool": PenTool,
    "Image": Image,
    "BookOpen": BookOpen,
    "CreditCard": CreditCard,
    "Tag": Tag,
    "Box": Box,
    "Briefcase": Briefcase,
    "Scissors": Scissors,
    "Coffee": Coffee,
    "Smile": Smile,
    "Star": Star
};

import { Category } from "@/data/mockData";

interface CategoryNavProps {
    categories?: Category[];
    activeCategory?: string;
    onSelect?: (categoryId: string) => void;
}

export function CategoryNav({ categories: propCategories, activeCategory, onSelect }: CategoryNavProps) {
    const { categories: contextCategories } = useAdmin();
    const categoriesRaw = contextCategories.length > 0 ? contextCategories : (propCategories || []);

    // Filter: Top-level only (!parentId) AND showOnHome !== false
    const categories = [...categoriesRaw]
        .filter(c => !c.parentId && c.showOnHome !== false)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar -mx-4 md:mx-0 md:px-0 scroll-smooth">
            {categories.map((category) => {
                const IconComponent = category.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : LayoutGrid;

                return (
                    <button
                        key={category.id}
                        onClick={() => onSelect ? onSelect(category.id) : null}
                        className="flex flex-col items-center gap-2 min-w-[88px] group"
                    >
                        <Link href={`/categoria/${category.id}`} className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                            activeCategory === category.id
                                ? "bg-brand/10 border-brand text-brand shadow-md"
                                : "bg-surface-secondary border-transparent text-gray-400 group-hover:bg-gray-100 group-hover:text-brand"
                        )}>
                            {category.image ? (
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <IconComponent size={32} strokeWidth={1.5} />
                            )}
                        </Link>
                        <span className={cn(
                            "text-xs font-medium text-center truncate w-full transition-colors",
                            activeCategory === category.id ? "text-brand" : "text-gray-600"
                        )}>
                            {category.name}
                        </span>
                    </button>
                )
            })}
        </div>
    );
}
