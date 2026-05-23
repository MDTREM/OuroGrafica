"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Upload, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
            enableColorSelector: true // Default true
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
        allowCustomDimensions: false,
        variations: [],
        hasDesignOption: true,
        active: true, // Default to true
        customText: {
            enabled: false,
            label: "Personalização",
            placeholder: "Digite aqui...",
            required: false,
            fields: []
        }
    });

    // Helper for array inputs
    const [tempQuantity, setTempQuantity] = useState("");
    const [tempFormat, setTempFormat] = useState("");
    const [tempFinish, setTempFinish] = useState("");
    const [tempImage, setTempImage] = useState("");

    // Temp state for price breakdown
    const [tempPriceQty, setTempPriceQty] = useState("");
    const [tempPriceVal, setTempPriceVal] = useState("");

    // UI Control for Variations
    const [newVariationName, setNewVariationName] = useState("");
    const [tempOptions, setTempOptions] = useState<{ [key: number]: string }>({});
    const [tempOptionPrices, setTempOptionPrices] = useState<{ [key: number]: string }>({});
    const [tempIllustrations, setTempIllustrations] = useState<{ [key: number]: string }>({});

    const [tempFormatIll, setTempFormatIll] = useState("");
    const [tempPrintingIll, setTempPrintingIll] = useState("");
    const [tempPrinting, setTempPrinting] = useState("");
    const [tempExtra, setTempExtra] = useState("");

    const addVariation = () => {
        if (!newVariationName.trim()) return;
        setFormData(prev => ({
            ...prev,
            variations: [...(prev.variations || []), { name: newVariationName, options: [] }]
        }));
        setNewVariationName("");
    };

    const addTemplateVariation = () => {
        setFormData(prev => ({
            ...prev,
            variations: [...(prev.variations || []), { name: "Modelo", options: [] }]
        }));
    };

    const removeVariation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variations: (prev.variations || []).filter((_, i) => i !== index)
        }));
    };

    const addOptionToVariation = (variationIndex: number) => {
        const option = tempOptions[variationIndex];
        const priceStr = tempOptionPrices[variationIndex];
        const illustration = tempIllustrations[variationIndex] || "";
        if (!option?.trim()) return;

        const price = parseFloat(priceStr?.replace(',', '.') || "0");

        setFormData(prev => {
            const newVars = [...(prev.variations || [])];
            const currentVar = newVars[variationIndex];

            const currentPrices = currentVar.prices || {};

            newVars[variationIndex] = {
                ...currentVar,
                options: [...currentVar.options, option],
                prices: price > 0 ? { ...currentPrices, [option]: price } : currentPrices,
            };

            const currentGlobalIll = prev.optionIllustrations || {};

            return { 
                ...prev, 
                variations: newVars,
                optionIllustrations: illustration ? { ...currentGlobalIll, [option]: illustration } : currentGlobalIll
            };
        });
        setTempOptions(prev => ({ ...prev, [variationIndex]: "" }));
        setTempOptionPrices(prev => ({ ...prev, [variationIndex]: "" }));
        setTempIllustrations(prev => ({ ...prev, [variationIndex]: "" }));
    };

    const removeOptionFromVariation = (variationIndex: number, optionIndex: number) => {
        setFormData(prev => {
            const newVars = [...(prev.variations || [])];
            newVars[variationIndex] = {
                ...newVars[variationIndex],
                options: newVars[variationIndex].options.filter((_, i) => i !== optionIndex)
            };
            return { ...prev, variations: newVars };
        });
    };

    const updateOptionImage = (variationIndex: number, option: string, imageUrl: string) => {
        setFormData(prev => {
            const newVars = [...(prev.variations || [])];
            const currentVar = newVars[variationIndex];
            const currentImages = currentVar.images || {};

            newVars[variationIndex] = {
                ...currentVar,
                images: { ...currentImages, [option]: imageUrl }
            };
            return { ...prev, variations: newVars };
        });
    };

    const addArrayItem = (field: "formats" | "finishes" | "quantities" | "printing" | "extras" | "images", value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        
        const ill = field === 'formats' ? tempFormatIll : field === 'printing' ? tempPrintingIll : "";

        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value],
            optionIllustrations: ill ? { ...(prev.optionIllustrations || {}), [value]: ill } : prev.optionIllustrations
        }));
        setter("");
        if (field === 'formats') setTempFormatIll("");
        if (field === 'printing') setTempPrintingIll("");
    };

    const removeArrayItem = (field: "quantities" | "formats" | "finishes" | "images" | "printing" | "extras", index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    const moveArrayItem = (field: "quantities" | "formats" | "finishes" | "images" | "printing" | "extras", index: number, direction: "left" | "right") => {
        setFormData(prev => {
            const list = [...(prev[field] || [])];
            if (direction === "left" && index > 0) {
                [list[index - 1], list[index]] = [list[index], list[index - 1]];
            } else if (direction === "right" && index < list.length - 1) {
                [list[index + 1], list[index]] = [list[index], list[index + 1]];
            }
            return { ...prev, [field]: list };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newProduct: Omit<Product, "id"> = {
            ...formData,
            title: formData.title || "Novo Produto",
            description: formData.description || "",
            category: formData.category || "Geral",
            price: isNaN(Number(formData.price)) ? 0 : Number(formData.price),
            image: formData.image || "",
            active: formData.active !== false,
        } as Omit<Product, "id">;

        const result = await addProduct(newProduct as Product);

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
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Produto Ativo?</span>
                    <Switch
                        checked={formData.active !== false}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, active: c }))}
                    />
                </div>
            </div>

            <div className="space-y-8 flex flex-col w-full">
                {/* 1 - Informações Básicas */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        1 - Informações Básicas
                    </h2>
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
                                className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-12 px-3 bg-white border border-gray-200"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: "" }))}
                            >
                                <option value="">Selecione...</option>
                                {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Subcategoria</label>
                            <select
                                className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-12 px-3 bg-white border border-gray-200"
                                value={formData.subcategory || ""}
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
                </div>

                {/* 2 - Imagens */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        2 - Imagens
                    </h2>
                    
                    {/* Imagem de Capa */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-900">Imagem de Capa (Home / Listagem)</label>
                            <p className="text-xs text-gray-500">Aparece nos cards da página inicial. Formato sugerido: <span className="text-brand">3:4 (Vertical)</span></p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="https://..."
                                    value={formData.image || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                />
                                <p className="text-[10px] text-gray-400">Cole o link da imagem ou use o upload ao lado.</p>
                            </div>
                            <label className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:bg-gray-100 transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const fData = new FormData();
                                        fData.append('file', file);
                                        const url = await uploadImage(fData, 'products');
                                        if (url) setFormData(prev => ({ ...prev, image: url }));
                                    }}
                                />
                                {formData.image ? (
                                    <img src={formData.image} alt="Capa" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="text-gray-300" />
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Galeria de Fotos */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-900">Galeria de Fotos Internas</label>
                            <p className="text-xs text-gray-500">Exibidas na página do produto. Formato sugerido: <span className="text-brand">16:9 (Retangular)</span></p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                className="flex-1"
                                placeholder="Link da imagem (https://...)"
                                value={tempImage}
                                onChange={(e) => setTempImage(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => addArrayItem("images", tempImage, setTempImage)}
                                className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-colors font-bold shadow-lg shadow-brand/20 flex items-center justify-center h-12"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {formData.images?.map((img, idx) => (
                                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => moveArrayItem("images", idx, "left")} disabled={idx === 0} className="bg-white/90 p-1.5 rounded-full hover:bg-white disabled:opacity-50"><ChevronLeft size={16} /></button>
                                        <button type="button" onClick={() => removeArrayItem("images", idx)} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50"><Trash2 size={16} /></button>
                                        <button type="button" onClick={() => moveArrayItem("images", idx, "right")} disabled={idx === (formData.images?.length || 0) - 1} className="bg-white/90 p-1.5 rounded-full hover:bg-white disabled:opacity-50"><ChevronRight size={16} /></button>
                                    </div>
                                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-xl">{idx + 1}</span>
                                </div>
                            ))}
                            {(formData.images?.length || 0) < 10 && (
                                <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-all aspect-video cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const fData = new FormData();
                                            fData.append('file', file);
                                            const url = await uploadImage(fData, 'products');
                                            if (url) addArrayItem("images", url, () => { });
                                        }}
                                    />
                                    <Upload size={20} className="mb-1" />
                                    <span className="text-[10px] font-medium">Upload ({formData.images?.length || 0}/10)</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3 - Valores */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        3 - Valores
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Preço Base (R$)"
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ ...prev, price: val === "" ? 0 : parseFloat(val) }));
                            }}
                            disabled={formData.priceBreakdowns && Object.keys(formData.priceBreakdowns).length > 0}
                            className={formData.priceBreakdowns && Object.keys(formData.priceBreakdowns).length > 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        />
                        {formData.priceBreakdowns && Object.keys(formData.priceBreakdowns).length > 0 && (
                            <p className="text-xs text-orange-600 mt-1 col-span-2">
                                * O preço base é ignorado quando a Tabela de Preços está ativa.
                            </p>
                        )}
                    </div>

                    {/* Price Table (Quantity-Based) */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-900">Tabela de Preços</label>
                                <p className="text-xs text-gray-500">Defina preços específicos para quantidades específicas.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs text-gray-500">Quantidade</label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 500"
                                        value={tempPriceQty}
                                        onChange={(e) => setTempPriceQty(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs text-gray-500">Preço Total (R$)</label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 150.00"
                                        value={tempPriceVal}
                                        onChange={(e) => setTempPriceVal(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const qty = parseInt(tempPriceQty);
                                        const val = parseFloat(tempPriceVal.replace(',', '.'));
                                        if (isNaN(qty) || isNaN(val)) return;
                                        setFormData(prev => ({
                                            ...prev,
                                            priceBreakdowns: {
                                                ...(prev.priceBreakdowns || {}),
                                                [qty]: val
                                            }
                                        }));
                                        setTempPriceQty("");
                                        setTempPriceVal("");
                                    }}
                                    className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold h-12 shadow-lg shadow-brand/20"
                                >
                                    Adicionar
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.priceBreakdowns && Object.entries(formData.priceBreakdowns)
                                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                                    .map(([qty, val]) => (
                                        <span key={qty} className="bg-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-250 shadow-sm">
                                            <span className="text-gray-900">{qty} un. = <span className="text-green-600">{formatPrice(val)}</span></span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => {
                                                        const next = { ...(prev.priceBreakdowns || {}) };
                                                        delete next[Number(qty)];
                                                        return { ...prev, priceBreakdowns: next };
                                                    });
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    {/* Quantidade Personalizada */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-950 text-sm">Quantidade Personalizada?</h4>
                                <p className="text-xs text-gray-500">Permite que o cliente digite qualquer quantidade desejada dentro dos limites.</p>
                            </div>
                            <Switch
                                checked={formData.customQuantity || false}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customQuantity: checked }))}
                            />
                        </div>

                        {formData.customQuantity ? (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 animate-in fade-in duration-300">
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
                        ) : (
                            <div className="space-y-1 pt-4 border-t border-gray-200">
                                <label className="text-sm font-medium text-gray-700">Opções Fixas de Quantidade</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        className="flex-1 rounded-xl text-sm focus:border-brand focus:ring-brand h-12 px-4 bg-white border border-gray-200"
                                        placeholder="Ex: 100"
                                        value={tempQuantity}
                                        onChange={e => setTempQuantity(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem("quantities", tempQuantity, setTempQuantity)}
                                        className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 flex items-center justify-center h-12"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.quantities?.map((item, idx) => (
                                        <span key={idx} className="bg-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-200 shadow-sm group">
                                            {item} un.
                                            <button type="button" onClick={() => removeArrayItem("quantities", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4 - Templates */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                            4 - Templates
                        </div>
                        <button
                            type="button"
                            onClick={addTemplateVariation}
                            className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/10 flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Adicionar Grupo de Templates
                        </button>
                    </h2>
                    <p className="text-xs text-gray-500">Configure os modelos prontos (templates) visuais. Use nomes contendo <span className="text-brand font-semibold">"Modelo"</span> ou <span className="text-brand font-semibold">"Template"</span> para ativar a galeria de modelos na página de produto.</p>
                    
                    {formData.variations?.filter(v => v.name.toLowerCase().includes('modelo') || v.name.toLowerCase().includes('template')).length === 0 ? (
                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                            Nenhum grupo de templates cadastrado. Clique no botão acima para adicionar um grupo.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formData.variations?.map((variation, vIdx) => {
                                if (!variation.name.toLowerCase().includes('modelo') && !variation.name.toLowerCase().includes('template')) return null;
                                return (
                                    <div key={vIdx} className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="font-bold text-sm text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-brand outline-none pb-0.5"
                                                    value={variation.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const newVars = [...(prev.variations || [])];
                                                            newVars[vIdx] = { ...newVars[vIdx], name: val };
                                                            return { ...prev, variations: newVars };
                                                        });
                                                    }}
                                                />
                                                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Galeria Ativa</span>
                                            </div>
                                            <button type="button" onClick={() => removeVariation(vIdx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {variation.options.map((option, oIdx) => {
                                                const varImage = variation.images?.[option];
                                                const priceAddon = variation.prices?.[option] || 0;
                                                
                                                return (
                                                    <div key={oIdx} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand/45 transition-all shadow-sm">
                                                        <div className="flex items-start justify-between p-3 gap-3">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <label className="w-16 h-20 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden group/img relative">
                                                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const fData = new FormData();
                                                                        fData.append('file', file);
                                                                        const url = await uploadImage(fData, 'products');
                                                                        if (url) updateOptionImage(vIdx, option, url);
                                                                    }} />
                                                                    {varImage ? (
                                                                        <>
                                                                            <img src={varImage} alt="" className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">TROCAR</div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center text-gray-300 group-hover/img:text-brand transition-colors text-center p-1">
                                                                            <Upload size={18} strokeWidth={1.5} />
                                                                            <span className="text-[7px] font-bold mt-1 uppercase leading-none">MOCKUP</span>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                                <div className="min-w-0">
                                                                    <span className="text-xs font-bold text-gray-900 block truncate">{option}</span>
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <span className="text-[9px] text-gray-400 font-semibold">+R$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            placeholder="0.00"
                                                                            value={priceAddon > 0 ? priceAddon : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                                                setFormData(prev => {
                                                                                    const newVars = [...(prev.variations || [])];
                                                                                    const currentPrices = newVars[vIdx].prices || {};
                                                                                    newVars[vIdx] = {
                                                                                        ...newVars[vIdx],
                                                                                        prices: { ...currentPrices, [option]: val }
                                                                                    };
                                                                                    return { ...prev, variations: newVars };
                                                                                });
                                                                            }}
                                                                            className="w-12 h-6 px-1 py-0.5 text-[10px] rounded border-gray-200 focus:border-brand focus:ring-brand font-bold text-green-600 bg-gray-50/50"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeOptionFromVariation(vIdx, oIdx)} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Option Input */}
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 rounded-xl border-gray-200 text-xs h-10 px-3 bg-white border border-gray-200"
                                                placeholder="Nome do Modelo (ex: Modelo Moderno)"
                                                value={tempOptions[vIdx] || ""}
                                                onChange={(e) => setTempOptions(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                            />
                                            <input
                                                className="w-24 rounded-xl border-gray-200 text-xs h-10 px-2 bg-white border border-gray-200"
                                                placeholder="+ R$ 0,00"
                                                type="number"
                                                value={tempOptionPrices[vIdx] || ""}
                                                onChange={(e) => setTempOptionPrices(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                            />
                                            <button type="button" onClick={() => addOptionToVariation(vIdx)} className="bg-brand text-white px-4 rounded-xl hover:bg-brand-dark font-bold text-xs h-10 shadow-lg shadow-brand/20 transition-all flex items-center justify-center">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 5 - Variações */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        5 - Variações
                    </h2>

                    {/* Formatos */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Formatos / Tamanhos</label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4 bg-white border border-gray-200" placeholder="Ex: 9x5cm" value={tempFormat} onChange={e => setTempFormat(e.target.value)} />
                                <button type="button" onClick={() => addArrayItem("formats", tempFormat, setTempFormat)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 h-12">Adicionar</button>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Desenho ilustrativo:</span>
                                {[
                                    { id: "", label: "Nenhum" },
                                    { id: "rectangular", label: "Retangular" },
                                    { id: "rounded", label: "Arredondado" }
                                ].map((ill) => (
                                    <button
                                        key={ill.id}
                                        type="button"
                                        onClick={() => setTempFormatIll(ill.id)}
                                        className={cn(
                                            "px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all whitespace-nowrap",
                                            tempFormatIll === ill.id
                                                ? "bg-brand/10 border-brand text-brand"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                        )}
                                    >
                                        {ill.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.formats?.map((item, idx) => (
                                    <span key={idx} className="bg-white text-xs px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-200 group relative shadow-sm">
                                        {formData.optionIllustrations?.[item] && (
                                            <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <div className={cn(
                                                    "border border-gray-400",
                                                    formData.optionIllustrations[item] === 'rectangular' ? "w-2 h-1" :
                                                    formData.optionIllustrations[item] === 'rounded' ? "w-2 h-1 rounded-xl" : ""
                                                )} />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-800">{item}</span>
                                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                                            <span className="text-[10px] text-gray-400 font-semibold">+ R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0,00" 
                                                value={formData.formatPrices?.[item] !== undefined ? formData.formatPrices[item] : ""} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        formatPrices: {
                                                            ...(prev.formatPrices || {}),
                                                            [item]: val
                                                        }
                                                    }));
                                                }} 
                                                className="w-16 h-7 px-1.5 py-0.5 text-[11px] rounded-lg border-gray-200 focus:border-brand focus:ring-brand text-green-600 font-bold bg-gray-50/50"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeArrayItem("formats", idx)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impressão */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Impressão</label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4 bg-white border border-gray-200" value={tempPrinting} onChange={e => setTempPrinting(e.target.value)} placeholder="Ex: 4x0 (Frente)" />
                                <button type="button" onClick={() => addArrayItem("printing", tempPrinting, setTempPrinting)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 h-12">Adicionar</button>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Desenho ilustrativo:</span>
                                {[
                                    { id: "", label: "Nenhum" },
                                    { id: "front", label: "Frente" },
                                    { id: "front_back", label: "Frente e Verso" }
                                ].map((ill) => (
                                    <button
                                        key={ill.id}
                                        type="button"
                                        onClick={() => setTempPrintingIll(ill.id)}
                                        className={cn(
                                            "px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all whitespace-nowrap",
                                            tempPrintingIll === ill.id
                                                ? "bg-brand/10 border-brand text-brand"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                        )}
                                    >
                                        {ill.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.printing?.map((item, idx) => (
                                    <span key={idx} className="bg-white text-xs px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-200 group relative shadow-sm">
                                        {formData.optionIllustrations?.[item] && (
                                            <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <div className={cn(
                                                    "border border-gray-400",
                                                    formData.optionIllustrations[item] === 'front' ? "w-1.5 h-2" :
                                                    formData.optionIllustrations[item] === 'front_back' ? "w-2 h-2 border-r-0 border-l-gray-400" : ""
                                                )} />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-800">{item}</span>
                                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                                            <span className="text-[10px] text-gray-400 font-semibold">+ R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0,00" 
                                                value={formData.printingPrices?.[item] !== undefined ? formData.printingPrices[item] : ""} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        printingPrices: {
                                                            ...(prev.printingPrices || {}),
                                                            [item]: val
                                                        }
                                                    }));
                                                }} 
                                                className="w-16 h-7 px-1.5 py-0.5 text-[11px] rounded-lg border-gray-200 focus:border-brand focus:ring-brand text-green-600 font-bold bg-gray-50/50"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeArrayItem("printing", idx)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Acabamentos */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Acabamentos</label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4 bg-white border border-gray-200" value={tempFinish} onChange={e => setTempFinish(e.target.value)} placeholder="Ex: Verniz Local" />
                                <button type="button" onClick={() => addArrayItem("finishes", tempFinish, setTempFinish)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 h-12">Adicionar</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.finishes?.map((item, idx) => (
                                    <span key={idx} className="bg-white text-xs px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-200 group relative shadow-sm">
                                        <span className="font-medium text-gray-800">{item}</span>
                                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                                            <span className="text-[10px] text-gray-400 font-semibold">+ R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0,00" 
                                                value={formData.finishPrices?.[item] !== undefined ? formData.finishPrices[item] : ""} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        finishPrices: {
                                                            ...(prev.finishPrices || {}),
                                                            [item]: val
                                                        }
                                                    }));
                                                }} 
                                                className="w-16 h-7 px-1.5 py-0.5 text-[11px] rounded-lg border-gray-200 focus:border-brand focus:ring-brand text-green-600 font-bold bg-gray-50/50"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeArrayItem("finishes", idx)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Extras</label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4 bg-white border border-gray-200" value={tempExtra} onChange={e => setTempExtra(e.target.value)} placeholder="Ex: Furo de 4mm" />
                                <button type="button" onClick={() => addArrayItem("extras", tempExtra, setTempExtra)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 h-12">Adicionar</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.extras?.map((item, idx) => (
                                    <span key={idx} className="bg-white text-xs px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-200 group relative shadow-sm">
                                        <span className="font-medium text-gray-800">{item}</span>
                                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                                            <span className="text-[10px] text-gray-400 font-semibold">+ R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0,00" 
                                                value={formData.extraPrices?.[item] !== undefined ? formData.extraPrices[item] : ""} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        extraPrices: {
                                                            ...(prev.extraPrices || {}),
                                                            [item]: val
                                                        }
                                                    }));
                                                }} 
                                                className="w-16 h-7 px-1.5 py-0.5 text-[11px] rounded-lg border-gray-200 focus:border-brand focus:ring-brand text-green-600 font-bold bg-gray-50/50"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeArrayItem("extras", idx)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Outras Variações & Templates */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Outras Variações & Templates</label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {formData.variations?.map((variation, vIdx) => {
                                if (variation.name.toLowerCase().includes('modelo') || variation.name.toLowerCase().includes('template')) return null;
                                return (
                                    <div key={vIdx} className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                className="font-bold text-sm text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-brand outline-none pb-0.5"
                                                value={variation.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => {
                                                        const newVars = [...(prev.variations || [])];
                                                        newVars[vIdx] = { ...newVars[vIdx], name: val };
                                                        return { ...prev, variations: newVars };
                                                    });
                                                }}
                                            />
                                            <button type="button" onClick={() => removeVariation(vIdx)} className="text-gray-350 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Options List */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {variation.options.map((opt, oIdx) => {
                                                const priceAddon = variation.prices?.[opt] || 0;
                                                const varImage = variation.images?.[opt];
                                                return (
                                                    <div key={oIdx} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand/45 transition-all shadow-sm">
                                                        <div className="flex items-start justify-between p-3 gap-3">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <label className="w-12 h-12 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden group/img relative">
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            const fData = new FormData();
                                                                            fData.append('file', file);
                                                                            const url = await uploadImage(fData, 'products');
                                                                            if (url) updateOptionImage(vIdx, opt, url);
                                                                        }}
                                                                    />
                                                                    {varImage ? (
                                                                        <>
                                                                            <img src={varImage} alt="" className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[8px] font-bold">ALT</div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center text-gray-300 group-hover/img:text-brand transition-colors text-center p-0.5">
                                                                            <Upload size={14} strokeWidth={1.5} />
                                                                        </div>
                                                                    )}
                                                                </label>
                                                                <div className="min-w-0">
                                                                    <span className="text-xs font-bold text-gray-900 block truncate">{opt}</span>
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <span className="text-[9px] text-gray-400 font-semibold">+R$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            placeholder="0.00"
                                                                            value={priceAddon > 0 ? priceAddon : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                                                                setFormData(prev => {
                                                                                    const newVars = [...(prev.variations || [])];
                                                                                    const currentPrices = newVars[vIdx].prices || {};
                                                                                    newVars[vIdx] = {
                                                                                        ...newVars[vIdx],
                                                                                        prices: { ...currentPrices, [opt]: val }
                                                                                    };
                                                                                    return { ...prev, variations: newVars };
                                                                                });
                                                                            }}
                                                                            className="w-12 h-6 px-1 py-0.5 text-[10px] rounded border-gray-200 focus:border-brand focus:ring-brand font-bold text-green-600 bg-gray-50/50"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeOptionFromVariation(vIdx, oIdx)} className="text-gray-350 hover:text-red-500"><X size={12} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Option Input */}
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 rounded-xl border-gray-200 text-xs h-10 px-3 bg-white border border-gray-200"
                                                    placeholder="Nova opção (ex: GG)"
                                                    value={tempOptions[vIdx] || ""}
                                                    onChange={(e) => setTempOptions(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                                />
                                                <input
                                                    className="w-24 rounded-xl border-gray-200 text-xs h-10 px-2 bg-white border border-gray-200"
                                                    placeholder="+ R$ 0,00"
                                                    type="number"
                                                    value={tempOptionPrices[vIdx] || ""}
                                                    onChange={(e) => setTempOptionPrices(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                                />
                                                <button type="button" onClick={() => addOptionToVariation(vIdx)} className="bg-brand text-white px-4 rounded-xl hover:bg-brand-dark font-bold text-xs h-10 shadow-lg shadow-brand/20 transition-all flex items-center justify-center">
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Illustration Selector */}
                                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                <span className="text-[10px] text-gray-400 font-semibold uppercase shrink-0">Ilustração:</span>
                                                {[
                                                    { id: "", label: "Nenhuma" },
                                                    { id: "rectangular", label: "Retangular" },
                                                    { id: "rounded", label: "Cantos Arred." },
                                                    { id: "front", label: "Frente" },
                                                    { id: "front_back", label: "Frente e Verso" }
                                                ].map((ill) => (
                                                    <button
                                                        key={ill.id}
                                                        type="button"
                                                        onClick={() => setTempIllustrations(prev => ({ ...prev, [vIdx]: ill.id }))}
                                                        className={cn(
                                                            "px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all whitespace-nowrap",
                                                            (tempIllustrations[vIdx] || "") === ill.id
                                                                ? "bg-brand/10 border-brand text-brand"
                                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                        )}
                                                    >
                                                        {ill.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add New Variation Group */}
                            <div className="flex gap-2 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                                <input
                                    className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-10 px-3 bg-white border border-gray-200"
                                    placeholder="Nome da Variação (ex: Cores do Papel)"
                                    value={newVariationName}
                                    onChange={(e) => setNewVariationName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={addVariation}
                                    className="bg-gray-900 text-white px-5 rounded-xl text-xs font-bold hover:bg-black transition-colors h-10"
                                >
                                    Adicionar Grupo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6 - Textos Personalizados */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                            6 - Textos Personalizados
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => {
                                    const fields = prev.customText?.fields || [];
                                    return {
                                        ...prev,
                                        customText: {
                                            ...(prev.customText || { enabled: true, label: "" }),
                                            enabled: true,
                                            fields: [...fields, { label: "", placeholder: "", required: false }]
                                        } as any
                                    };
                                });
                            }}
                            className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/10 flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Adicionar Campo de Texto
                        </button>
                    </h2>
                    <p className="text-xs text-gray-500">Crie campos personalizados para que o cliente envie informações de texto (Ex: nomes, dados de contato, WhatsApp) diretamente na página do produto.</p>

                    {/* Enable/Disable Main Switch */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-955 text-sm">Habilitar Campos Personalizados?</h4>
                            <p className="text-xs text-gray-500">Se ativo, renderiza os campos abaixo na página de produto.</p>
                        </div>
                        <Switch
                            checked={formData.customText?.enabled || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                customText: {
                                    ...(prev.customText || { label: "", fields: [] }),
                                    enabled: checked
                                } as any
                            }))}
                        />
                    </div>

                    {/* Dynamic Fields List */}
                    {formData.customText?.enabled && (
                        <div className="space-y-4">
                            {(formData.customText?.fields || []).map((field, fIdx) => (
                                <div key={fIdx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 relative space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campo #{fIdx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const nextFields = (prev.customText?.fields || []).filter((_, idx) => idx !== fIdx);
                                                    return {
                                                        ...prev,
                                                        customText: {
                                                            ...prev.customText!,
                                                            fields: nextFields
                                                        } as any
                                                    };
                                                });
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Título do Campo (Label)"
                                            placeholder="Ex: Nome para o Material"
                                            value={field.label}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => {
                                                    const nextFields = [...(prev.customText?.fields || [])];
                                                    nextFields[fIdx] = { ...nextFields[fIdx], label: val };
                                                    return {
                                                        ...prev,
                                                        customText: { ...prev.customText!, fields: nextFields } as any
                                                    };
                                                });
                                            }}
                                        />
                                        <Input
                                            label="Exemplo / Dica (Placeholder)"
                                            placeholder="Ex: João e Maria"
                                            value={field.placeholder || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => {
                                                    const nextFields = [...(prev.customText?.fields || [])];
                                                    nextFields[fIdx] = { ...nextFields[fIdx], placeholder: val };
                                                    return {
                                                        ...prev,
                                                        customText: { ...prev.customText!, fields: nextFields } as any
                                                    };
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={field.required || false}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => {
                                                    const nextFields = [...(prev.customText?.fields || [])];
                                                    nextFields[fIdx] = { ...nextFields[fIdx], required: checked };
                                                    return {
                                                        ...prev,
                                                        customText: { ...prev.customText!, fields: nextFields } as any
                                                    };
                                                });
                                            }}
                                        />
                                        <span className="text-sm text-gray-700">Preenchimento Obrigatório?</span>
                                    </div>
                                </div>
                            ))}

                            {(formData.customText?.fields || []).length === 0 && (
                                <div className="text-center p-6 bg-yellow-50/50 rounded-xl border border-dashed border-yellow-200 text-yellow-800 text-xs">
                                    Nenhum campo personalizado dinâmico cadastrado. Clique em <strong>"Adicionar Campo de Texto"</strong> no topo direito para criar o primeiro campo!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lista de Itens com Valor */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-955 text-sm">Lista de Itens com Valor (Ex: Cardápio)</h4>
                                <p className="text-xs text-gray-500">Habilita uma seção interativa para o cliente listar itens e somar valores ao total do material.</p>
                            </div>
                            <Switch
                                checked={formData.customText?.menuItemsEnabled || false}
                                onCheckedChange={(checked) => setFormData(prev => ({
                                    ...prev,
                                    customText: {
                                        ...(prev.customText || { enabled: false, label: "" }),
                                        menuItemsEnabled: checked,
                                        menuItemsLabel: prev.customText?.menuItemsLabel || "Itens do Cardápio",
                                        menuItemsPlaceholder: prev.customText?.menuItemsPlaceholder || "Ex: Pizza de Calabresa...",
                                        menuItemsRequired: prev.customText?.menuItemsRequired || false
                                    } as any
                                }))}
                            />
                        </div>

                        {formData.customText?.menuItemsEnabled && (
                            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 animate-in fade-in duration-300">
                                <Input
                                    label="Título da Lista (Label)"
                                    placeholder="Ex: Itens do Cardápio"
                                    value={formData.customText?.menuItemsLabel || ""}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customText: { ...prev.customText!, menuItemsLabel: e.target.value } as any
                                    }))}
                                />
                                <Input
                                    label="Dica para o Input (Placeholder)"
                                    placeholder="Ex: Pizza de Calabresa..."
                                    value={formData.customText?.menuItemsPlaceholder || ""}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customText: { ...prev.customText!, menuItemsPlaceholder: e.target.value } as any
                                    }))}
                                />
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.customText?.menuItemsRequired || false}
                                        onCheckedChange={(c) => setFormData(prev => ({
                                            ...prev,
                                            customText: { ...prev.customText!, menuItemsRequired: c } as any
                                        }))}
                                    />
                                    <span className="text-sm text-gray-700">Preenchimento Obrigatório? (Mínimo de 1 item)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 7 - Opcionais */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        7 - Opcionais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Design Option Config */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between h-full gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-955 text-sm">Opção de Arte Final?</h4>
                                <p className="text-xs text-gray-500 mt-1">Habilita a seção para o cliente enviar seu arquivo de arte ou contratar a criação de arte final da gráfica.</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs font-bold text-gray-600">Status</span>
                                <Switch
                                    checked={formData.hasDesignOption !== false}
                                    onCheckedChange={(c) => setFormData(prev => ({ ...prev, hasDesignOption: c }))}
                                />
                            </div>
                        </div>

                        {/* Color Selector Config */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between h-full gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-955 text-sm">Ativar Seletor de Cores?</h4>
                                <p className="text-xs text-gray-500 mt-1">Exibe a seção "Cor Base" na página do produto para que o cliente selecione a tonalidade do material.</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs font-bold text-gray-600">Status</span>
                                <Switch
                                    checked={formData.technicalSpecs?.enableColorSelector !== false}
                                    onCheckedChange={(c) => setFormData(prev => ({
                                        ...prev,
                                        technicalSpecs: {
                                            ...(prev.technicalSpecs || {}),
                                            enableColorSelector: c
                                        } as any
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 8 - Descrições */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        8 - Descrições
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Descrição Curta</label>
                            <p className="text-xs text-gray-400 mb-1">Resumo curto que aparece nos cards de listagem e nas visualizações simplificadas.</p>
                            <textarea
                                className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-24 p-3 bg-white border border-gray-200"
                                placeholder="Resumo que aparece no card do produto..."
                                value={formData.description || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1 pt-4 border-t border-gray-100">
                            <label className="text-sm font-semibold text-gray-700">Descrição Completa</label>
                            <p className="text-xs text-gray-400 mb-1">Texto explicativo principal com especificações detalhadas do produto.</p>
                            <textarea
                                className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-64 p-3 bg-white border border-gray-200"
                                placeholder="Detalhes completos do produto..."
                                value={formData.fullDescription || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* 9 - Detalhes Técnicos */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        9 - Detalhes Técnicos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Papel / Material</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: Couchê 300g"
                                value={formData.technicalSpecs?.paper || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, paper: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Gramatura</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 300g"
                                value={formData.technicalSpecs?.weight || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, weight: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Peso</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 10kg"
                                value={formData.technicalSpecs?.mass || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, mass: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Enobrecimento</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: Laminação Fosca"
                                value={formData.technicalSpecs?.ennoblement || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, ennoblement: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Cores</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 4x0"
                                value={formData.technicalSpecs?.colors || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, colors: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tamanho Final</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 9x5cm"
                                value={formData.technicalSpecs?.finalSize || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, finalSize: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tamanho com Sangria</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 9.2x5.2cm"
                                value={formData.technicalSpecs?.bleedSize || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, bleedSize: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Prazo de Produção</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-sm bg-white"
                                placeholder="Ex: 5 dias úteis"
                                value={formData.technicalSpecs?.productionTime || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, productionTime: e.target.value } }))}
                            />
                        </div>
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
                    className="flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 hover:bg-gradient-to-r from-brand to-brand-dark-dark transition-colors disabled:opacity-50"
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
