"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Default closed as requested ("deixe o filtro fechado")
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        price: false,
        deadline: false
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === params.get(key)) {
            params.delete(key); // Toggle off if clicked again (for radios it's tricky, but checkboxes ok)
        } else {
            params.set(key, value);
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const currentPrice = searchParams.get('price');
    const currentDeadline = searchParams.get('deadline');

    return (
        <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Filter size={18} className="text-brand" />
                        Filtros
                    </h3>
                    {(currentPrice || currentDeadline) && (
                        <button onClick={() => router.push(window.location.pathname)} className="text-xs text-brand hover:underline font-medium">
                            Limpar
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-100">
                    {/* Price Filter */}
                    <div className="p-0">
                        <button
                            onClick={() => toggleSection('price')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                        >
                            <span className="text-sm font-bold text-gray-700 uppercase">Preço</span>
                            {openSections['price'] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {openSections['price'] && (
                            <div className="p-4 pt-0 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand">
                                    <input
                                        type="radio"
                                        name="price"
                                        className="text-brand focus:ring-brand"
                                        checked={currentPrice === 'low'}
                                        onChange={() => handleFilterChange('price', 'low')}
                                    /> Até R$ 50
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand">
                                    <input
                                        type="radio"
                                        name="price"
                                        className="text-brand focus:ring-brand"
                                        checked={currentPrice === 'mid'}
                                        onChange={() => handleFilterChange('price', 'mid')}
                                    /> R$ 50 - R$ 100
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand">
                                    <input
                                        type="radio"
                                        name="price"
                                        className="text-brand focus:ring-brand"
                                        checked={currentPrice === 'high'}
                                        onChange={() => handleFilterChange('price', 'high')}
                                    /> Acima de R$ 100
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Deadline Filter */}
                    <div className="p-0">
                        <button
                            onClick={() => toggleSection('deadline')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                        >
                            <span className="text-sm font-bold text-gray-700 uppercase">Prazo</span>
                            {openSections['deadline'] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {openSections['deadline'] && (
                            <div className="p-4 pt-0 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand">
                                    <input
                                        type="checkbox"
                                        className="rounded text-brand focus:ring-brand"
                                        checked={currentDeadline === '24h'}
                                        onChange={() => handleFilterChange('deadline', '24h')}
                                    /> Entrega em 24h
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand">
                                    <input
                                        type="checkbox"
                                        className="rounded text-brand focus:ring-brand"
                                        checked={currentDeadline === 'free'}
                                        onChange={() => handleFilterChange('deadline', 'free')}
                                    /> Frete Grátis
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
