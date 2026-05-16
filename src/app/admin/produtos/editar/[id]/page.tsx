"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Image as ImageIcon,
    Save,
    Upload,
    Check,
    Plus,
    X,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { Product } from "@/data/mockData";
import { Switch } from "@/components/ui/Switch";
import { uploadImage } from "@/actions/homepage-actions";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { products, updateProduct, categories } = useAdmin();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // Find product - initially null until loaded
    const productToEdit = products.find(p => p.id === resolvedParams.id);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        technicalSpecs: {},
        quantities: [],
        formats: [],
        finishes: [],
        images: [],
        customQuantity: false,
        minQuantity: 1,
        maxQuantity: 1000,
        allowCustomDimensions: false,
        variations: []
    });

    // Helpers
    const [tempQuantity, setTempQuantity] = useState("");
    const [tempFormat, setTempFormat] = useState("");
    const [tempFinish, setTempFinish] = useState("");
    const [tempImage, setTempImage] = useState("");

    // Temp state for price breakdown
    const [tempPriceQty, setTempPriceQty] = useState("");
    const [tempPriceVal, setTempPriceVal] = useState("");

    // UI Control for Optional Variations
    const [hasVariations, setHasVariations] = useState(false);
    const [newVariationName, setNewVariationName] = useState("");
    const [tempOptions, setTempOptions] = useState<Record<number, string>>({});
    const [tempOptionPrices, setTempOptionPrices] = useState<Record<number, string>>({});
    const [tempOptionImages, setTempOptionImages] = useState<Record<number, string>>({});
    const [tempIllustrations, setTempIllustrations] = useState<Record<number, string>>({}); // Selected illustration type for variations

    const [tempFormatIll, setTempFormatIll] = useState("");
    const [tempPrintingIll, setTempPrintingIll] = useState(""); // Illustration for Printing
    const [tempPrinting, setTempPrinting] = useState("");
    const [tempExtra, setTempExtra] = useState("");


    // Load data when product is found
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                ...productToEdit,
                technicalSpecs: productToEdit.technicalSpecs || {},
                quantities: productToEdit.quantities || [],
                formats: productToEdit.formats || [],
                finishes: productToEdit.finishes || [],
                printing: productToEdit.printing || [],
                extras: productToEdit.extras || [],
                images: productToEdit.images || (productToEdit.image ? [productToEdit.image] : []),
                customQuantity: productToEdit.customQuantity || false,
                minQuantity: productToEdit.minQuantity || 1,
                maxQuantity: productToEdit.maxQuantity || 1000,
                allowCustomDimensions: productToEdit.allowCustomDimensions || false
            });

            // Init hasVariations based on data
            const hasFormats = productToEdit.formats && productToEdit.formats.length > 0;
            const hasFinishes = productToEdit.finishes && productToEdit.finishes.length > 0;
            const hasDynamicVariations = productToEdit.variations && productToEdit.variations.length > 0;
            setHasVariations(!!hasFormats || !!hasFinishes || !!hasDynamicVariations);
        }
    }, [productToEdit]);

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

            // Initialize maps if not exists
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productToEdit) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const updatedProduct: Product = {
            ...productToEdit,
            ...formData,
            price: isNaN(Number(formData.price)) ? (productToEdit.price || 0) : Number(formData.price),
            active: formData.active !== false, // Ensure boolean
        } as Product;

        const result = await updateProduct(updatedProduct);

        if (result.success) {
            router.push("/admin/produtos");
        } else {
            alert("Erro ao atualizar produto: " + (result.error?.message || "Erro desconhecido"));
            setIsLoading(false);
        }
    };

    if (!productToEdit) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Produto não encontrado.</p>
                <Link href="/admin/produtos" className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark hover:underline mt-2 inline-block">Voltar</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
                        <p className="text-gray-500">Editando: {formData.title}</p>
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
                    {/* Variations & Templates (PRIORITY #1) */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-brand/20 shadow-xl shadow-brand/5 space-y-8 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Templates e Variações</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure os modelos prontos e opções técnicas do produto.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-700">Ativar Variações?</span>
                                <Switch
                                    checked={hasVariations}
                                    onCheckedChange={(checked) => {
                                        setHasVariations(checked);
                                        if (!checked) {
                                            setFormData(prev => ({ ...prev, formats: [], finishes: [] }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {hasVariations && (
                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                                {/* Formats */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Formatos</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4" placeholder="Ex: 9x5cm" value={tempFormat} onChange={e => setTempFormat(e.target.value)} />
                                            <button type="button" onClick={() => addArrayItem("formats", tempFormat, setTempFormat)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20">Adicionar</button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Desenho:</span>
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
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap",
                                                        tempFormatIll === ill.id
                                                            ? "bg-brand/10 border-brand text-brand shadow-sm"
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
                                            <span key={idx} className="bg-gray-50 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-100 group hover:border-brand/30 transition-all">
                                                {formData.optionIllustrations?.[item] && (
                                                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                        <div className={cn(
                                                            "border border-gray-400",
                                                            formData.optionIllustrations[item] === 'rectangular' ? "w-2.5 h-1.5" :
                                                            formData.optionIllustrations[item] === 'rounded' ? "w-2.5 h-1.5 rounded-[2px]" : ""
                                                        )} />
                                                    </div>
                                                )}
                                                <span className="text-gray-700">{item}</span>
                                                <button type="button" onClick={() => removeArrayItem("formats", idx)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Printing */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cores de Impressão</label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand h-12 px-4" value={tempPrinting} onChange={e => setTempPrinting(e.target.value)} placeholder="Ex: 4x0 (Frente)" />
                                            <button type="button" onClick={() => addArrayItem("printing", tempPrinting, setTempPrinting)} className="bg-brand text-white px-6 rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20">Adicionar</button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Ilustração:</span>
                                            {[
                                                { id: "", label: "Nenhuma" },
                                                { id: "front", label: "Só Frente" },
                                                { id: "front_back", label: "Frente e Verso" }
                                            ].map((ill) => (
                                                <button
                                                    key={ill.id}
                                                    type="button"
                                                    onClick={() => setTempPrintingIll(ill.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap",
                                                        tempPrintingIll === ill.id
                                                            ? "bg-brand/10 border-brand text-brand shadow-sm"
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
                                            <span key={idx} className="bg-gray-50 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-100 group hover:border-brand/30 transition-all">
                                                {formData.optionIllustrations?.[item] && (
                                                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                        <div className={cn(
                                                            "border border-gray-400",
                                                            formData.optionIllustrations[item] === 'front' ? "w-1.5 h-2" :
                                                            formData.optionIllustrations[item] === 'front_back' ? "w-2.5 h-2 border-r-0 border-l-gray-400" : ""
                                                        )} />
                                                    </div>
                                                )}
                                                <span className="text-gray-700">{item}</span>
                                                <button type="button" onClick={() => removeArrayItem("printing", idx)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Variations (Templates!) */}
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-brand rounded-full"></div>
                                            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Outras Variações & Templates</label>
                                        </div>
                                        <span className="text-[10px] text-brand font-bold bg-brand/5 px-2 py-1 rounded">Dica: Use o nome "Modelo" para galeria visual</span>
                                    </div>

                                    <div className="space-y-6">
                                        {formData.variations?.map((variation, vIdx) => (
                                            <div key={vIdx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-gray-900 uppercase tracking-tight">{variation.name}</span>
                                                        {variation.name.toLowerCase().includes('modelo') && (
                                                            <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Galeria Ativa</span>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => removeVariation(vIdx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {variation.options.map((option, oIdx) => {
                                                        const varImage = variation.images?.[option];
                                                        const priceAddon = variation.prices?.[option] || 0;
                                                        
                                                        return (
                                                            <div key={oIdx} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand/40 transition-all shadow-sm">
                                                                <div className="flex items-start justify-between p-3 gap-3">
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <label className="w-16 h-20 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden group/img relative">
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
                                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">TROCAR</div>
                                                                                </>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center text-gray-300 group-hover/img:text-brand transition-colors">
                                                                                    <Upload size={20} strokeWidth={1.5} />
                                                                                    <span className="text-[8px] font-bold mt-1 uppercase">TEMPLATE</span>
                                                                                </div>
                                                                            )}
                                                                        </label>
                                                                        <div className="min-w-0">
                                                                            <span className="text-xs font-bold text-gray-900 block truncate">{option}</span>
                                                                            <span className="text-[10px] font-bold text-brand mt-0.5 block">
                                                                                {priceAddon > 0 ? `+ ${formatPrice(priceAddon)}` : 'S/ adicional'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button type="button" onClick={() => removeOptionFromVariation(vIdx, oIdx)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 items-end">
                                                    <div className="md:col-span-1 space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Nome da Opção</label>
                                                        <input className="w-full rounded-xl border-gray-200 text-xs h-10 px-3" placeholder="Ex: Modelo 01" value={tempOptions[vIdx] || ""} onChange={(e) => setTempOptions(prev => ({ ...prev, [vIdx]: e.target.value }))} />
                                                    </div>
                                                    <div className="md:col-span-1 space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Acréscimo R$</label>
                                                        <input className="w-full rounded-xl border-gray-200 text-xs h-10 px-3" placeholder="+ 0,00" type="number" value={tempOptionPrices[vIdx] || ""} onChange={(e) => setTempOptionPrices(prev => ({ ...prev, [vIdx]: e.target.value }))} />
                                                    </div>
                                                    <div className="md:col-span-1 space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Imagem (Opcional)</label>
                                                        <label className="flex items-center justify-center w-full h-10 rounded-xl border border-dashed border-gray-300 bg-white hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group">
                                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const fData = new FormData();
                                                                fData.append('file', file);
                                                                const url = await uploadImage(fData, 'products');
                                                                if (url) {
                                                                    // We store it temporarily in a state or just wait for the user to click 'Add'
                                                                    // For simplicity, let's just add the option immediately if they upload an image? 
                                                                    // No, let's store the temp image URL
                                                                    setTempOptionImages(prev => ({ ...prev, [vIdx]: url }));
                                                                }
                                                            }} />
                                                            {tempOptionImages[vIdx] ? (
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-brand">
                                                                    <Check size={14} /> PRONTO
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 group-hover:text-brand">
                                                                    <Upload size={14} /> SUBIR ARTE
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const name = tempOptions[vIdx];
                                                            const price = tempOptionPrices[vIdx];
                                                            const img = tempOptionImages[vIdx];
                                                            if (!name) return;
                                                            
                                                            addOptionToVariation(vIdx);
                                                            if (img) {
                                                                // The standard addOptionToVariation doesn't take an image, 
                                                                // let's update the image immediately after
                                                                updateOptionImage(vIdx, name, img);
                                                                setTempOptionImages(prev => ({ ...prev, [vIdx]: "" }));
                                                            }
                                                        }} 
                                                        className="md:col-span-1 bg-brand text-white rounded-xl hover:bg-brand-dark font-bold text-xs h-10 shadow-lg shadow-brand/20 transition-all"
                                                    >
                                                        Adicionar Opção
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex gap-3 pt-4">
                                            <input className="flex-1 rounded-xl border-gray-200 text-sm h-12 px-4 shadow-inner" placeholder="Nome (Ex: Modelo, Cor, Tamanho)" value={newVariationName} onChange={(e) => setNewVariationName(e.target.value)} />
                                            <button type="button" onClick={addVariation} className="bg-gray-900 text-white px-8 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">Criar Variação</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Basic Details */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Informações Básicas</h3>

                        <Input
                            label="Nome do Produto"
                            value={formData.title || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Categoria</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm"
                                    value={formData.category || ""} // Stores ID
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
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={formData.allowCustomDimensions ? "Preço por m² (R$)" : "Preço Base (R$)"}
                                type="number"
                                value={formData.price || 0}
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
                                    <label className="text-sm font-bold text-gray-900">Venda por Metro Quadrado (m²)</label>
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
                                    <label className="text-sm font-bold text-gray-900">Tabela de Preços</label>
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
                                                        <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-bold">R$ {price.toFixed(2)}</span>
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
                                <label className="text-sm font-bold text-gray-900">Personalização de Texto</label>
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
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
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
                            value={formData.description || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Descrição Completa</label>
                        <textarea
                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand text-sm h-64"
                            value={formData.fullDescription || ""}
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
                                value={formData.technicalSpecs?.paper || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, paper: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Gramatura</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 300g"
                                value={formData.technicalSpecs?.weight || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, weight: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Peso</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 10kg"
                                value={formData.technicalSpecs?.mass || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, mass: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Enobrecimento</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: Laminação Fosca"
                                value={formData.technicalSpecs?.ennoblement || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, ennoblement: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Cores</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 4x0"
                                value={formData.technicalSpecs?.colors || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, colors: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tamanho Final</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 9x5cm"
                                value={formData.technicalSpecs?.finalSize || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, finalSize: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tam. com Sangria</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 9.2x5.2cm"
                                value={formData.technicalSpecs?.bleedSize || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, bleedSize: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Prazo de Produção</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                                placeholder="Ex: 5 dias úteis"
                                value={formData.technicalSpecs?.productionTime || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: { ...prev.technicalSpecs, productionTime: e.target.value } }))}
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


            </div>

            <div className="space-y-8">
                {/* Display Options */}
            </div>
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Link href="/admin/produtos" className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 hover:bg-gradient-to-r from-brand to-brand-dark-dark transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Salvando..." : (
                        <>
                            <Save size={18} />
                            Salvar Alterações
                        </>
                    )}
                </button>
            </div>
        </form >
    );
}
