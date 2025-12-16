"use client";

import { cn } from "@/lib/utils";

import { useAdmin } from "@/contexts/AdminContext";

interface Category {
    id: string;
    name: string;
    image?: string;
}

interface CategoryNavProps {
    categories?: Category[]; // Make optional as we'll prefer context
    activeCategory?: string;
    onSelect?: (categoryId: string) => void;
}

export function CategoryNav({ categories: propCategories, activeCategory, onSelect }: CategoryNavProps) {
    const { categories: contextCategories } = useAdmin();

    // Use context categories if available (client-side), otherwise props (server-side initial)
    // Actually, since this is a client component and we want persistence, we should rely on context.
    const categories = contextCategories.length > 0 ? contextCategories : (propCategories || []);
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar -mx-4 md:mx-0 md:px-0">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelect?.(category.id)}
                    className="flex flex-col items-center gap-2 min-w-[88px] group"
                >
                    <div className={cn(
                        "w-20 h-20 rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2",
                        activeCategory === category.id
                            ? "bg-brand/10 border-brand text-brand shadow-md"
                            : "bg-surface-secondary border-transparent text-gray-400 group-hover:bg-gray-200"
                    )}>
                        {/* Placeholder for Image - using initial if no image */}
                        {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-[10px]" />
                        ) : (
                            <span>{category.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <span className={cn(
                        "text-xs font-medium text-center truncate w-full transition-colors",
                        activeCategory === category.id ? "text-brand" : "text-gray-600"
                    )}>
                        {category.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
