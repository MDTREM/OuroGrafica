"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils"; // Not used directly in input but useful
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import { Product } from "@/data/mockData";
import { Switch } from "@/components/ui/Switch";
import { uploadImage } from "@/actions/homepage-actions";

export default function NewProductPage() {
    const { addProduct, categories } = useAdmin();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        title: "",
        description: "", // Short description
        fullDescription: "",
        category: "",
        subcategory: "",
        price: 0,
        unit: "",
        images: [],
        technicalSpecs: {
            paper: "",
            colors: "",
            weight: "",
            finalSize: "",
            productionTime: "",
        },
        quantities: [],
        formats: [],
        finishes: [],
        isNew: false,
        isBestSeller: false,
        isFeatured: false,
        customQuantity: false,
        minQuantity: 1,
        maxQuantity: 1000,
    });

    // Helper for array inputs
    const [tempQuantity, setTempQuantity] = useState("");
    const [tempFormat, setTempFormat] = useState("");
    const [tempFinish, setTempFinish] = useState("");
    const [tempImage, setTempImage] = useState("");

    // UI Control for Optional Variations
    const [hasVariations, setHasVariations] = useState(true);



    const addArrayItem = (field: "quantities" | "formats" | "finishes" | "images", value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        setter("");
    };

    const removeArrayItem = (field: "quantities" | "formats" | "finishes" | "images", index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newProduct: Product = {
            id: Math.random().toString(36).substr(2, 9), // Generate ID
            title: formData.title || "Novo Produto",
            description: formData.description || "",
            category: formData.category || "Geral",
            price: Number(formData.price) || 0,
            image: formData.images?.[0] || "", // Use first image as main
            ...formData,
        } as Product;

        const result = await addProduct(newProduct);

        if (result.success) {
            router.push("/admin/produtos");
        } else {
            alert("Erro ao salvar produto: " + (result.error?.message || "Erro desconhecido"));
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
                        <p className="text-gray-500">Adicione um novo item ao catálogo.</p>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Informações Básicas</h3>

                        <Input
                            label="Nome do Produto"
                            placeholder="Ex: Cartão de Visita Premium"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Categoria</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm"
                                    value={formData.category} // Stores ID
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: "" }))}
                                >
                                    <option value="">Selecione...</option>
                                    {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Subcategoria</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm"
                                    value={formData.subcategory} // Stores ID
                                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                    disabled={!formData.category}
                                >
                                    <option value="">Selecione...</option>
                                    {categories
                                        .filter(c => c.parentId === formData.category)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Preço Base (R$)"
                                type="number"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                            />
                        </div>


                        {/* Custom Quantity Toggle */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-900">Quantidade Personalizada</label>
                                    <p className="text-xs text-gray-500">Permitir que o cliente digite a quantidade (ex: 1 a 1000).</p>
                                </div>
                                <Switch
                                    checked={formData.customQuantity || false}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customQuantity: checked }))}
                                />
                            </div>

                            {formData.customQuantity && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        label="Mínimo"
                                        type="number"
                                        value={formData.minQuantity || 1}
                                        onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: parseInt(e.target.value) }))}
                                    />
                                    <Input
                                        label="Máximo"
                                        type="number"
                                        value={formData.maxQuantity || 1000}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) }))}
                                    />
                                </div>
                            )}

                            {!formData.customQuantity && (
                                <div className="space-y-1 mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-sm font-medium text-gray-700">Unidades (Opções Fixas)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand"
                                            placeholder="Ex: 100 un."
                                            value={tempQuantity}
                                            onChange={e => setTempQuantity(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem("quantities", tempQuantity, setTempQuantity)}
                                            className="bg-brand text-white p-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-md shadow-brand/10"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.quantities?.map((item, idx) => (
                                            <span key={idx} className="bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 group">
                                                {item}
                                                <button type="button" onClick={() => removeArrayItem("quantities", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Descrição Curta</label>
                        <textarea
                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-20"
                            placeholder="Resumo que aparece no card do produto..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Descrição Completa (Opcional)</label>
                        <textarea
                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-32"
                            placeholder="Detalhes completos do produto..."
                            value={formData.fullDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Imagens</h3>

                        <div className="flex gap-2">
                            <Input
                                className="flex-1"
                                placeholder="https://..."
                                value={tempImage}
                                onChange={(e) => setTempImage(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem("images", tempImage, setTempImage)}
                                className="bg-brand text-white p-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 flex items-center justify-center"
                                title="Adicionar Imagem"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {formData.images?.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem("images", idx)}
                                            className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-md backdrop-blur-sm">
                                        {idx + 1}
                                    </span>
                                </div>
                            ))}
                            {(formData.images?.length || 0) < 10 && (
                                <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all aspect-square cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // Optional: Show loading state specifically for this button
                                            const formData = new FormData();
                                            formData.append('file', file);

                                            const url = await uploadImage(formData);
                                            if (url) {
                                                addArrayItem("images", url, () => { });
                                            } else {
                                                alert("Erro ao enviar imagem.");
                                            }
                                        }}
                                    />
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-xs font-medium">Upload</span>
                                    <span className="text-[10px] opacity-70 mt-1">{formData.images?.length || 0}/10</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Ficha Técnica (Opcional)</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Papel / Material" value={formData.technicalSpecs?.paper} onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, paper: e.target.value } }))} />
                            <Input label="Gramatura" value={formData.technicalSpecs?.weight} onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, weight: e.target.value } }))} />
                            <Input label="Cores" value={formData.technicalSpecs?.colors} onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, colors: e.target.value } }))} />
                            <Input label="Tamanho Final" value={formData.technicalSpecs?.finalSize} onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, finalSize: e.target.value } }))} />
                            <Input label="Prazo de Produção" value={formData.technicalSpecs?.productionTime} onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, productionTime: e.target.value } }))} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Display Options */}

                    {/* Variations */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-900">Variações do Produto</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">Adicionar Variações?</span>
                                <Switch
                                    checked={hasVariations}
                                    onCheckedChange={(checked) => {
                                        setHasVariations(checked);
                                        if (!checked) {
                                            // Clear variations if disabled
                                            setFormData(prev => ({ ...prev, formats: [], finishes: [] }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {hasVariations && (
                            <>
                                {/* Formats */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Formatos/Tamanhos</label>
                                    <div className="flex gap-2 mb-3">
                                        <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" placeholder="Ex: 9x5cm" value={tempFormat} onChange={e => setTempFormat(e.target.value)} />
                                        <button type="button" onClick={() => addArrayItem("formats", tempFormat, setTempFormat)} className="bg-brand text-white p-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-md shadow-brand/10"><Plus size={18} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.formats?.map((item, idx) => (
                                            <span key={idx} className="bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 group">
                                                {item}
                                                <button type="button" onClick={() => removeArrayItem("formats", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Finishes */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Acabamentos</label>
                                    <div className="flex gap-2 mb-3">
                                        <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" placeholder="Ex: Laminação Fosca" value={tempFinish} onChange={e => setTempFinish(e.target.value)} />
                                        <button type="button" onClick={() => addArrayItem("finishes", tempFinish, setTempFinish)} className="bg-brand text-white p-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-md shadow-brand/10"><Plus size={18} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.finishes?.map((item, idx) => (
                                            <span key={idx} className="bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 group">
                                                {item}
                                                <button type="button" onClick={() => removeArrayItem("finishes", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons (Bottom) */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Link href="/admin/produtos" className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
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
                            Salvar Produto
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
