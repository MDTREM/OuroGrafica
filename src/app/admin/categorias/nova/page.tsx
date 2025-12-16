"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Category } from "@/data/mockData";
import { uploadImage } from "@/actions/homepage-actions";

export default function NewCategoryPage() {
    const { addCategory, categories } = useAdmin();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Category>>({
        id: "",
        name: "",
        parentId: "",
        image: "",
        showOnHome: false,
        showOnMenu: true
    });

    const [tempImage, setTempImage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Auto-generate ID if empty or slugify name
        const finalId = formData.id?.trim() || formData.name?.toLowerCase().replace(/\s+/g, '-') || "cat-" + Math.random().toString(36).substr(2, 5);

        const newCategory: Category = {
            ...formData,
            id: finalId,
            name: formData.name || "Nova Categoria",
        } as Category;

        const result = await addCategory(newCategory);

        if (result.success) {
            router.push("/admin/categorias");
        } else {
            alert("Erro ao salvar categoria: " + (result.error?.message || "Erro desconhecido"));
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categorias" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Nova Categoria</h1>
                        <p className="text-gray-500">Adicione uma nova seção à loja.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <Input
                    label="Nome da Categoria"
                    placeholder="Ex: Cartões de Visita"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="ID da Categoria (Slug)"
                        placeholder="Ex: cartoes-visita"
                        value={formData.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                        hint="Identificador único usado na URL."
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Subcategoria de (Opcional)</label>
                        <select
                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm"
                            value={formData.parentId}
                            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                        >
                            <option value="">Nenhuma (Categoria Principal)</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Imagem de Capa</label>
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <Input
                                placeholder="https://..."
                                value={formData.image}
                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500">Cole o link da imagem ou use o botão de upload (simulado).</p>
                        </div>
                        <label className="w-24 h-24 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:bg-gray-100 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    const url = await uploadImage(formData);

                                    if (url) {
                                        setFormData(prev => ({ ...prev, image: url }));
                                    } else {
                                        alert("Erro ao enviar imagem.");
                                    }
                                }}
                            />
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="text-gray-300" />
                            )}
                        </label>
                    </div>
                </div>

                {/* Visibility */}
                <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Visibilidade</h3>
                    <div className="divide-y divide-gray-50">
                        <Switch
                            label="Mostrar na Página Inicial"
                            checked={!!formData.showOnHome}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, showOnHome: c }))}
                        />
                        <Switch
                            label="Mostrar no Menu Principal"
                            checked={!!formData.showOnMenu}
                            onCheckedChange={(c) => setFormData(prev => ({ ...prev, showOnMenu: c }))}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Link href="/admin/categorias" className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-brand text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Salvando..." : (
                        <>
                            <Save size={18} />
                            Salvar Categoria
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
