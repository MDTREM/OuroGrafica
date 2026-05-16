"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils"; // Not used directly in input but useful
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
    });

    // Helper for array inputs
    const [tempQuantity, setTempQuantity] = useState("");
    const [tempFormat, setTempFormat] = useState("");
    const [tempFinish, setTempFinish] = useState("");
    const [tempImage, setTempImage] = useState("");

    // Temp state for price breakdown
    const [tempPriceQty, setTempPriceQty] = useState("");
    const [tempPriceVal, setTempPriceVal] = useState("");

    // UI Control for Optional Variations
    const [hasVariations, setHasVariations] = useState(true);
    const [newVariationName, setNewVariationName] = useState("");
    const [tempOptions, setTempOptions] = useState<{ [key: number]: string }>({});
    const [tempOptionPrices, setTempOptionPrices] = useState<{ [key: number]: string }>({}); // Store temp price as string for input
    const [tempIllustrations, setTempIllustrations] = useState<{ [key: number]: string }>({}); // Selected illustration type for variations

    const [tempFormatIll, setTempFormatIll] = useState("");
    const [tempPrintingIll, setTempPrintingIll] = useState(""); // Illustration for Printing
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

            // Global mapping
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



    const addArrayItem = (field: "formats" | "finishes" | "quantities" | "printing" | "extras", value: string, setter: (v: string) => void) => {
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
            active: formData.active !== false, // Ensure boolean
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
                        <h1 className="text-2xl font-semibold text-gray-900">Novo Produto</h1>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Informações Básicas</h3>

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
                                    value={formData.subcategory || ""} // Stores ID
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
                                label={formData.allowCustomDimensions ? "Preço por m² (R$)" : "Preço Base (R$)"}
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

                        {/* Custom Dimensions Toggle (m²) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Venda por Metro Quadrado (m²)</label>
                                    <p className="text-xs text-gray-500">Permite que o cliente digite largura e altura. O preço cadastrado acima será cobrado por m².</p>
                                </div>
                                <Switch
                                    checked={formData.allowCustomDimensions || false}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowCustomDimensions: checked }))}
                                />
                            </div>
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
                                        <label className="text-xs text-gray-500">Valor Total (R$)</label>
                                        <Input
                                            type="number"
                                            placeholder="Ex: 130.00"
                                            value={tempPriceVal}
                                            onChange={(e) => setTempPriceVal(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const qty = parseInt(tempPriceQty);
                                            const val = parseFloat(tempPriceVal);
                                            if (qty && val >= 0) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    priceBreakdowns: { ...prev.priceBreakdowns, [qty]: val },
                                                    // Optionally sync with quantities list
                                                    quantities: prev.quantities ? Array.from(new Set([...prev.quantities, `${qty}`])) : [`${qty}`]
                                                }));
                                                setTempPriceQty("");
                                                setTempPriceVal("");
                                            }
                                        }}
                                        className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark mb-0.5"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.priceBreakdowns && Object.entries(formData.priceBreakdowns).length > 0 ? (
                                        Object.entries(formData.priceBreakdowns)
                                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                            .map(([qty, price]) => (
                                                <div key={qty} className="flex justify-between items-center bg-white p-2 px-3 rounded-lg border border-gray-200">
                                                    <span className="text-sm font-medium">{qty} un.</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-semibold">R$ {price.toFixed(2)}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newBreakdown = { ...formData.priceBreakdowns };
                                                                delete newBreakdown[parseInt(qty)];
                                                                setFormData(prev => ({ ...prev, priceBreakdowns: newBreakdown }));
                                                            }}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-2">Nenhum preço fixo configurado.</p>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Custom Quantity Toggle */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Quantidade Personalizada</label>
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
                                            className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark transition-colors shadow-md shadow-brand/10"
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

                    {/* Custom Text Input (Personalization) */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-900">Personalização de Texto</label>
                                <p className="text-xs text-gray-500">Adicione um campo para o cliente digitar algo (Ex: Nome, Turma).</p>
                            </div>
                            <Switch
                                checked={formData.customText?.enabled || false}
                                onCheckedChange={(checked) => setFormData(prev => ({
                                    ...prev,
                                    customText: {
                                        enabled: checked,
                                        label: prev.customText?.label || "Personalização",
                                        placeholder: prev.customText?.placeholder || "Digite aqui...",
                                        required: prev.customText?.required || false
                                    }
                                }))}
                            />
                        </div>

                        {/* Design Option Config */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Opção de Arte Final?</h4>
                                    <p className="text-xs text-gray-500">Exibe a seção para cliente enviar ou contratar arte.</p>
                                </div>
                                <Switch
                                    checked={formData.hasDesignOption !== false} // Default true
                                    onCheckedChange={(c) => setFormData(prev => ({ ...prev, hasDesignOption: c }))}
                                />
                            </div>
                        </div>

                        {formData.customText?.enabled && (
                            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-200 pt-4">
                                <Input
                                    label="Título do Campo (Label)"
                                    placeholder="Ex: Qual o nome da criança?"
                                    value={formData.customText.label}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customText: { ...prev.customText!, label: e.target.value }
                                    }))}
                                />
                                <Input
                                    label="Dica (Placeholder)"
                                    placeholder="Ex: Maria - 1º Ano B"
                                    value={formData.customText.placeholder}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customText: { ...prev.customText!, placeholder: e.target.value }
                                    }))}
                                />
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.customText.required || false}
                                        onCheckedChange={(c) => setFormData(prev => ({
                                            ...prev,
                                            customText: { ...prev.customText!, required: c }
                                        }))}
                                    />
                                    <span className="text-sm text-gray-700">Preenchimento Obrigatório?</span>
                                </div>
                            </div>
                        )}
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
                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-64"
                            placeholder="Detalhes completos do produto..."
                            value={formData.fullDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Ficha Técnica */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        Detalhes Técnicos (Ficha Técnica)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Papel / Material</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: Couchê 300g"
                                        value={formData.technical_specs?.paper || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, paper: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Gramatura</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 300g"
                                        value={formData.technical_specs?.weight || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, weight: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Peso</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 10kg"
                                        value={formData.technical_specs?.mass || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, mass: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Enobrecimento</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: Laminação Fosca"
                                        value={formData.technical_specs?.ennoblement || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, ennoblement: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Cores</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 4x0"
                                        value={formData.technical_specs?.colors || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, colors: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Tamanho Final</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 9x5cm"
                                        value={formData.technical_specs?.finalSize || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, finalSize: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Tam. com Sangria</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 9.2x5.2cm"
                                        value={formData.technical_specs?.bleedSize || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, bleedSize: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Prazo de Produção</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                        placeholder="Ex: 5 dias úteis"
                                        value={formData.technical_specs?.productionTime || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, productionTime: e.target.value } }))}
                                    />
                                </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Imagens do Produto</h3>

                    {/* 1. Imagem de Capa (4:3) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-semibold text-gray-900">Imagem de Capa (Home / Listagem)</label>
                                <p className="text-xs text-gray-500">Aparece nos cards da página inicial. Formato sugerido: <span className="text-brand">3:4 (Vertical)</span></p>
                            </div>
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
                                        const formDataFile = new FormData();
                                        formDataFile.append('file', file);
                                        const url = await uploadImage(formDataFile, 'products');
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

                    <div className="pt-6 border-t border-gray-50">
                        {/* 2. Galeria do Produto (16:9) */}
                        <div className="space-y-4">
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
                                    hint="Máximo de 10 fotos na galeria."
                                />
                                <button
                                    type="button"
                                    onClick={() => addArrayItem("images", tempImage, setTempImage)}
                                    className="bg-brand text-white p-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 flex items-center justify-center"
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
                                        <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded-md">{idx + 1}</span>
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
                                                const formDataFile = new FormData();
                                                formDataFile.append('file', file);
                                                const url = await uploadImage(formDataFile, 'products');
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
                </div>



                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Display Options */}

                    {/* Variations */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Variações do Produto</h3>
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
                                    <div className="space-y-2 mb-4">
                                        <div className="flex gap-2">
                                            <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" placeholder="Ex: 9x5cm" value={tempFormat} onChange={e => setTempFormat(e.target.value)} />
                                            <button type="button" onClick={() => addArrayItem("formats", tempFormat, setTempFormat)} className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark transition-colors shadow-md shadow-brand/10"><Plus size={18} /></button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            {[
                                                { id: "", label: "Nenhuma" },
                                                { id: "rectangular", label: "Retangular" },
                                                { id: "rounded", label: "Cantos Arred." }
                                            ].map((ill) => (
                                                <button
                                                    key={ill.id}
                                                    type="button"
                                                    onClick={() => setTempFormatIll(ill.id)}
                                                    className={cn(
                                                        "px-2 py-1 rounded-md text-[10px] font-semibold border transition-all whitespace-nowrap",
                                                        tempFormatIll === ill.id
                                                            ? "bg-brand/10 border-brand text-brand"
                                                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                    )}
                                                >
                                                    {ill.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.formats?.map((item, idx) => (
                                            <span key={idx} className="bg-white text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 border border-gray-200 group relative">
                                                {formData.optionIllustrations?.[item] && (
                                                    <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <div className={cn(
                                                            "border border-gray-400",
                                                            formData.optionIllustrations[item] === 'rectangular' ? "w-2 h-1" :
                                                            formData.optionIllustrations[item] === 'rounded' ? "w-2 h-1 rounded-[1px]" : ""
                                                        )} />
                                                    </div>
                                                )}
                                                <span className="font-medium">{item}</span>
                                                <button type="button" onClick={() => removeArrayItem("formats", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Printing (NEW) */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Impressão</label>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex gap-2">
                                            <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" value={tempPrinting} onChange={e => setTempPrinting(e.target.value)} placeholder="Ex: 4x0 (Frente)" />
                                            <button type="button" onClick={() => addArrayItem("printing", tempPrinting, setTempPrinting)} className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark"><Plus size={18} /></button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            {[
                                                { id: "", label: "Nenhuma" },
                                                { id: "front", label: "Frente" },
                                                { id: "front_back", label: "Frente e Verso" }
                                            ].map((ill) => (
                                                <button
                                                    key={ill.id}
                                                    type="button"
                                                    onClick={() => setTempPrintingIll(ill.id)}
                                                    className={cn(
                                                        "px-2 py-1 rounded-md text-[10px] font-semibold border transition-all whitespace-nowrap",
                                                        tempPrintingIll === ill.id
                                                            ? "bg-brand/10 border-brand text-brand"
                                                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                    )}
                                                >
                                                    {ill.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.printing?.map((item, idx) => (
                                            <span key={idx} className="bg-white text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 border border-gray-200 group relative">
                                                {formData.optionIllustrations?.[item] && (
                                                    <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <div className={cn(
                                                            "border border-gray-400",
                                                            formData.optionIllustrations[item] === 'front' ? "w-1.5 h-2" :
                                                            formData.optionIllustrations[item] === 'front_back' ? "w-2 h-2 border-r-0 border-l-gray-400" : ""
                                                        )} />
                                                    </div>
                                                )}
                                                <span className="font-medium">{item}</span>
                                                <button type="button" onClick={() => removeArrayItem("printing", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Acabamentos */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Acabamentos</label>
                                    <div className="flex gap-2 mb-3">
                                        <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" value={tempFinish} onChange={e => setTempFinish(e.target.value)} placeholder="Ex: Verniz Local" />
                                        <button type="button" onClick={() => addArrayItem("finishes", tempFinish, setTempFinish)} className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark"><Plus size={18} /></button>
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

                                {/* Extras (NEW) */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Extras</label>
                                    <div className="flex gap-2 mb-3">
                                        <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand" value={tempExtra} onChange={e => setTempExtra(e.target.value)} placeholder="Ex: Furo de 4mm" />
                                        <button type="button" onClick={() => addArrayItem("extras", tempExtra, setTempExtra)} className="bg-gradient-to-r from-brand to-brand-dark text-white p-2.5 rounded-xl hover:bg-gradient-to-r from-brand to-brand-dark-dark"><Plus size={18} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.extras?.map((item, idx) => (
                                            <span key={idx} className="bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 group">
                                                {item}
                                                <button type="button" onClick={() => removeArrayItem("extras", idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {hasVariations && (
                            <div className="pt-4 border-t border-gray-100">
                                <label className="text-sm font-semibold text-gray-900 block mb-3">Outras Variações</label>

                                <div className="space-y-4">
                                    {formData.variations?.map((variation, vIdx) => (
                                        <div key={vIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-sm text-gray-800">{variation.name}</span>
                                                <button type="button" onClick={() => removeVariation(vIdx)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Options List */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {variation.options.map((opt, oIdx) => {
                                                    const priceAddon = variation.prices?.[opt] || 0;
                                                    const varImage = variation.images?.[opt];
                                                    return (
                                                        <span key={oIdx} className="bg-white text-xs px-2 py-1 rounded border border-gray-200 flex items-center gap-1 group relative">

                                                            {/* Image Preview / Upload */}
                                                            <label className="cursor-pointer flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 overflow-hidden relative border border-gray-200">
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;

                                                                        // Show simple loading state here if needed, or just rely on async
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        const url = await uploadImage(formData, 'products');
                                                                        if (url) {
                                                                            setFormData(prev => {
                                                                                const newVars = [...(prev.variations || [])];
                                                                                const currentImages = newVars[vIdx].images || {};
                                                                                newVars[vIdx] = {
                                                                                    ...newVars[vIdx],
                                                                                    images: { ...currentImages, [opt]: url }
                                                                                };
                                                                                return { ...prev, variations: newVars };
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            {varImage ? (
                                                                <img src={varImage} alt={opt} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                                                            ) : formData.optionIllustrations?.[opt] && (
                                                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                    <div className={cn(
                                                                        "border border-gray-400",
                                                                        formData.optionIllustrations[opt] === 'rectangular' ? "w-2.5 h-1.5" :
                                                                        formData.optionIllustrations[opt] === 'rounded' ? "w-2.5 h-1.5 rounded-[2px]" :
                                                                        formData.optionIllustrations[opt] === 'front' ? "w-1.5 h-2" :
                                                                        formData.optionIllustrations[opt] === 'front_back' ? "w-2 h-2 border-r-0 border-l-gray-400" : ""
                                                                    )} />
                                                                </div>
                                                            )}

                                                            <span className="font-medium">{opt}</span>
                                                            {priceAddon > 0 && <span className="text-green-600 font-semibold ml-1">+{formatPrice(priceAddon)}</span>}
                                                            <button type="button" onClick={() => removeOptionFromVariation(vIdx, oIdx)} className="text-gray-400 hover:text-red-500 ml-1"><X size={10} /></button>
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            {/* Add Option Input */}
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 rounded-lg border-gray-200 text-xs h-8"
                                                        placeholder="Nova opção (ex: GG)"
                                                        value={tempOptions[vIdx] || ""}
                                                        onChange={(e) => setTempOptions(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                                    />
                                                    <input
                                                        className="w-24 rounded-lg border-gray-200 text-xs h-8"
                                                        placeholder="+ R$ 0,00"
                                                        type="number"
                                                        value={tempOptionPrices[vIdx] || ""}
                                                        onChange={(e) => setTempOptionPrices(prev => ({ ...prev, [vIdx]: e.target.value }))}
                                                    />
                                                    <button type="button" onClick={() => addOptionToVariation(vIdx)} className="bg-gray-200 text-gray-600 px-2 rounded-lg hover:bg-gray-300 h-8">
                                                        <Plus size={14} />
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
                                                                "px-2 py-1 rounded-md text-[10px] font-semibold border transition-all whitespace-nowrap",
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
                                    ))}

                                    {/* Add New Variation Group */}
                                    <div className="flex gap-2 mt-4">
                                        <input
                                            className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand"
                                            placeholder="Nome da Variação (ex: Cor)"
                                            value={newVariationName}
                                            onChange={(e) => setNewVariationName(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={addVariation}
                                            className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black transition-colors"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
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
