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
        <div className="relative">
            <div className="flex items-start gap-4 md:gap-12 overflow-x-auto pb-4 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                {categories.map((category) => {
                    const IconComponent = category.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : LayoutGrid;

                    return (
                        <Link
                            key={category.id}
                            href={`/categoria/${category.id}`}
                            className="flex flex-col items-center gap-3 group shrink-0 snap-start"
                        >
                            <div className={cn(
                                "w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full flex items-center justify-center transition-all border-2 bg-gray-100 overflow-hidden",
                                activeCategory === category.id
                                    ? "border-brand shadow-lg scale-105"
                                    : "border-transparent group-hover:border-gray-200 group-hover:bg-white"
                            )}>
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <IconComponent size={38} strokeWidth={1.2} className={cn(
                                        "transition-colors duration-300",
                                        activeCategory === category.id ? "text-brand" : "text-gray-400 group-hover:text-brand"
                                    )} />
                                )}
                            </div>
                            <span className={cn(
                                "text-xs md:text-sm font-medium text-center leading-tight transition-colors max-w-[100px] md:max-w-[130px]",
                                activeCategory === category.id ? "text-brand font-semibold" : "text-gray-600 group-hover:text-gray-900"
                            )}>
                                {category.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
