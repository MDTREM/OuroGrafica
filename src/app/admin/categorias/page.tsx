"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Plus, Edit, Trash2 } from "lucide-react";

import Link from "next/link";

export default function AdminCategoriesPage() {
    const { categories, deleteCategory } = useAdmin();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                    <p className="text-gray-500">Organize os produtos da loja.</p>
                </div>
                <Link href="/admin/categorias/nova" className="bg-brand text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark transition-colors flex items-center gap-2">
                    <Plus size={18} />
                    Nova Categoria
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c.id !== "todos").map((category) => (
                    <div key={category.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
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
