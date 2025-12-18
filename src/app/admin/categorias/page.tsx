"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import { useState, useEffect } from "react";

import Link from "next/link";

export default function AdminCategoriesPage() {
    const { categories, deleteCategory, updateCategory } = useAdmin();
    const [localCategories, setLocalCategories] = useState(categories);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalCategories(categories.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    }, [categories]);

    const moveCategory = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...localCategories];
        if (direction === 'up' && index > 0) {
            [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
        } else if (direction === 'down' && index < newCategories.length - 1) {
            [newCategories[index + 1], newCategories[index]] = [newCategories[index], newCategories[index + 1]];
        }

        // Re-assign order_index based on new position
        const reordered = newCategories.map((cat, idx) => ({ ...cat, order_index: idx }));

        setLocalCategories(reordered);
        setHasChanges(true);
    };

    const saveOrder = async () => {
        // Bulk update or individual updates
        // Supabase typically handles individual updates unless RPC used.
        // We'll map promises
        setHasChanges(false); // Optimistic
        await Promise.all(localCategories.map(cat => updateCategory(cat)));
        alert("Ordem salva com sucesso!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                    <p className="text-gray-500">Organize os produtos da loja.</p>
                </div>
                <div className="flex gap-2">
                    {hasChanges && (
                        <button onClick={saveOrder} className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors flex items-center gap-2 animate-in fade-in">
                            <Save size={18} />
                            Salvar Ordem
                        </button>
                    )}
                    <Link href="/admin/categorias/nova" className="bg-brand text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark transition-colors flex items-center gap-2">
                        <Plus size={18} />
                        Nova Categoria
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {localCategories.filter(c => c.id !== "todos").map((category, idx) => (
                    <div key={category.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1 mr-2">
                                <button
                                    onClick={() => moveCategory(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 text-gray-400 hover:text-brand disabled:opacity-30"
                                >
                                    <ChevronUp size={20} />
                                </button>
                                <button
                                    onClick={() => moveCategory(idx, 'down')}
                                    disabled={idx === localCategories.length - 1}
                                    className="p-1 text-gray-400 hover:text-brand disabled:opacity-30"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                                {category.image ? (
                                    <img src={category.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold uppercase">{category.name.substring(0, 2)}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{category.name}</h3>
                                <p className="text-xs text-gray-500">ID: {category.id}</p>
                                {category.parentId && <p className="text-[10px] text-gray-400">Sub de: {categories.find(c => c.id === category.parentId)?.name}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/categorias/editar/${category.id}`} className="p-2 text-gray-400 hover:text-brand transition-colors">
                                <Edit size={16} />
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm("Deseja excluir esta categoria?")) {
                                        deleteCategory(category.id);
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
