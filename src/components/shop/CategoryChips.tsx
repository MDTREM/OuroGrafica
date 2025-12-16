"use client";

import { cn } from "@/lib/utils";

interface CategoryChipsProps {
    categories: string[];
    activeCategory?: string;
    onSelect?: (category: string) => void;
}

export function CategoryChips({ categories, activeCategory, onSelect }: CategoryChipsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar -mx-4 md:mx-0 md:px-0">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect?.(category)}
                    className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                        activeCategory === category
                            ? "bg-brand text-white shadow-md shadow-brand/20"
                            : "bg-surface-secondary text-gray-600 hover:bg-gray-200"
                    )}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
