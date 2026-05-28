"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Truck, Package, ArrowUpRight, ChevronDown, ChevronUp, UploadCloud, Plus, X, Info, Download } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn, formatPrice } from "@/lib/utils";
import { ComboItem } from "@/actions/homepage-actions";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/mockData";

interface ComboClientProps {
    combo: ComboItem;
}

function parseComboItem(itemStr: string, products: Product[]) {
    const match = itemStr.match(/^(\d+)\s*(.*)$/);
    let qty = 1;
    let rest = itemStr.trim();
    if (match) {
        qty = parseInt(match[1]);
        rest = match[2].trim();
    }

    let nameSearch = rest;
    const options: Record<string, string> = {};
    
    const parenMatch = rest.match(/^(.*?)\s*\((.*)\)\s*$/);
    if (parenMatch) {
        nameSearch = parenMatch[1].trim();
        const optionsContent = parenMatch[2].trim();
        optionsContent.split(",").forEach(part => {
            const colonIdx = part.indexOf(":");
            if (colonIdx !== -1) {
                const key = part.slice(0, colonIdx).trim();
                const value = part.slice(colonIdx + 1).trim();
                options[key] = value;
            }
        });
    }

    const lowerSearch = nameSearch.toLowerCase();
    
    let matchedProduct = products.find(p => p.title.toLowerCase() === lowerSearch);
    
    if (!matchedProduct) {
        matchedProduct = products.find(p => 
            lowerSearch.includes(p.title.toLowerCase()) || 
            p.title.toLowerCase().includes(lowerSearch)
        );
    }
    
    if (!matchedProduct) {
        const keywords = lowerSearch.split(/\s+/).filter(k => k.length > 3);
        if (keywords.length > 0) {
            matchedProduct = products.find(p => 
                keywords.some(k => p.title.toLowerCase().includes(k))
            );
        }
    }

    if (!matchedProduct && products.length > 0) {
        if (lowerSearch.includes("cartão") || lowerSearch.includes("cartao")) {
            matchedProduct = products.find(p => p.title.toLowerCase().includes("cartão") || p.title.toLowerCase().includes("cartao"));
        } else if (lowerSearch.includes("panfleto") || lowerSearch.includes("flyer") || lowerSearch.includes("folheto")) {
            matchedProduct = products.find(p => p.title.toLowerCase().includes("flyer") || p.title.toLowerCase().includes("panfleto"));
        } else if (lowerSearch.includes("adesivo") || lowerSearch.includes("tag")) {
            matchedProduct = products.find(p => p.title.toLowerCase().includes("adesivo") || p.title.toLowerCase().includes("tag"));
        }
    }

    return {
        qty,
        nameSearch,
        options,
        product: matchedProduct
    };
}

function getProductPriceForQty(product: Product, qty: number) {
    if (!product) return 0;
    
    if (product.priceBreakdowns && product.priceBreakdowns[qty]) {
        return product.priceBreakdowns[qty];
    }
    
    const basePrice = product.price || 0;
    
    if (product.priceBreakdowns) {
        const keys = Object.keys(product.priceBreakdowns).map(Number).sort((a,b)=>a-b);
        if (keys.length > 0) {
            if (qty <= keys[0]) {
                return (product.priceBreakdowns[keys[0]] / keys[0]) * qty;
            }
            let lastKey = keys[0];
            for (const key of keys) {
                if (qty >= key) {
                    lastKey = key;
                } else {
                    const lastVal = product.priceBreakdowns[lastKey];
                    const nextVal = product.priceBreakdowns[key];
                    return lastVal + ((nextVal - lastVal) / (key - lastKey)) * (qty - lastKey);
                }
            }
            return (product.priceBreakdowns[lastKey] / lastKey) * qty;
        }
    }
    
    const baseQty = product.quantities && product.quantities.length > 0
        ? parseInt(product.quantities[0].match(/\d+/)?.[0] || "100")
        : 100;
    return (basePrice / baseQty) * qty;
}

export default function ComboClient({ combo }: ComboClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const comboImages = combo.images && combo.images.length > 0 ? combo.images : (combo.image ? [combo.image] : []);

    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({});
    const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    const [customizations, setCustomizations] = useState<{
        [itemId: number]: {
            purchaseMode: "simple" | "advanced";
            selectedTemplate: string;
            selectedTemplateImage: string | null;
            artworkFile: { name: string; url: string } | null;
            uploadedFile: { name: string; url: string } | null;
            customTextValue: string;
            dynamicTextValues: { [key: number]: string };
            menuItems: { id: string; name: string; price: string }[];
            newItemName: string;
            selectedFormat: string;
            selectedFinish: string;
            selectedPrinting: string;
            selectedExtra: string;
            selectedColor: string;
            customHex: string;
            selectedVariations: { [key: string]: string };
            isUploadingLogo?: boolean;
            isUploadingArtwork?: boolean;
        }
    }>({});

    const [expandedColorsItem, setExpandedColorsItem] = useState<number | null>(null);
    const [showSpecs, setShowSpecs] = useState<{ [key: number]: boolean }>({});

    const toggleExpandedItem = (idx: number) => {
        setExpandedItems(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Componente de Ilustração Visual
    const VisualIllustration = ({ type, option, product }: { type: "format" | "print", option: string, product: Product }) => {
        const finalManualType = product.optionIllustrations?.[option];
        
        const isRounded = finalManualType === 'rounded' || (!finalManualType && option.toLowerCase().includes("arredondado"));
        const isFrontAndBack = finalManualType === 'front_back' || (!finalManualType && (option.toLowerCase().includes("frente e verso") || option.toLowerCase().includes("f/v")));
        const isRectangular = finalManualType === 'rectangular' || (!finalManualType && option.toLowerCase().includes("retangular"));
        const isFrontOnly = finalManualType === 'front' || (!finalManualType && !isFrontAndBack && (option.toLowerCase().includes("frente") || option.toLowerCase().includes("4x0")));

        if (type === "format" || finalManualType === 'rectangular' || finalManualType === 'rounded') {
            return (
                <div className="w-full aspect-[16/10] bg-gray-50 flex items-center justify-center p-3 rounded-t-lg">
                    <div className={cn(
                        "w-3/4 h-3/4 border border-gray-400 flex items-center justify-center transition-all duration-500",
                        isRounded ? "rounded-lg" : "rounded-2xs"
                    )}>
                        <div className={cn(
                            "w-1/2 h-1/2 border border-gray-300 transition-all duration-500",
                            isRounded ? "rounded-lg" : "rounded-2xs"
                        )} />
                    </div>
                </div>
            );
        }

        if (type === "print" || finalManualType === 'front' || finalManualType === 'front_back') {
            return (
                <div className="w-full aspect-[16/10] bg-gray-50 flex items-center justify-center p-3 gap-1.5 rounded-t-lg">
                    {/* Frente */}
                    <div className="w-10 h-12 border border-gray-400 rounded-lg flex items-center justify-center text-gray-500 font-semibold text-sm bg-white shadow-2xs">
                        F
                    </div>
                    {/* Verso */}
                    <div className={cn(
                        "w-10 h-12 border rounded-lg flex items-center justify-center text-gray-500 font-semibold text-sm shadow-2xs",
                        isFrontAndBack ? "border-gray-400 bg-white" : "border-gray-100 bg-gray-50 text-gray-300"
                    )}>
                        {isFrontAndBack ? "V" : ""}
                    </div>
                </div>
            );
        }

        return null;
    };

    // Fetch products
    useEffect(() => {
        async function loadProducts() {
            try {
                const { data, error } = await supabase.from('products').select('*').eq('active', true);
                if (data && data.length > 0) {
                    const { mapProduct } = await import('@/lib/product-mapper');
                    setCatalogProducts(data.map(mapProduct));
                } else {
                    const { PRODUCTS } = await import('@/data/mockData');
                    setCatalogProducts(PRODUCTS);
                }
            } catch (e) {
                console.error("Error loading products for combo mapping:", e);
                const { PRODUCTS } = await import('@/data/mockData');
                setCatalogProducts(PRODUCTS);
            } finally {
                setLoadingProducts(false);
            }
        }
        loadProducts();
    }, []);



    // Initialize customizations for each combo item
    useEffect(() => {
        if (combo && catalogProducts.length > 0) {
            const initialCustomizations: typeof customizations = {};
            combo.items.forEach((itemStr, idx) => {
                const { qty, product, options } = parseComboItem(itemStr, catalogProducts);
                if (product) {
                    const hasTemplates = product.variations?.some(v => 
                        v.name.toLowerCase().includes("modelo") || 
                        v.name.toLowerCase().includes("template")
                    ) || false;
                    
                    const initialVariations: { [key: string]: string } = {
                        "Cor Base": "Branco"
                    };
                    if (product.variations) {
                        product.variations.forEach(v => {
                            if (options && options[v.name]) {
                                initialVariations[v.name] = options[v.name];
                            } else if (v.options.length > 0) {
                                initialVariations[v.name] = v.options[0];
                            }
                        });
                    }

                    initialCustomizations[idx] = {
                        purchaseMode: "simple",
                        selectedTemplate: product.variations?.find(v => 
                            v.name.toLowerCase().includes("modelo") || 
                            v.name.toLowerCase().includes("template")
                        )?.options[0] || "",
                        selectedTemplateImage: null,
                        artworkFile: null,
                        uploadedFile: null,
                        customTextValue: "",
                        dynamicTextValues: {},
                        menuItems: [],
                        newItemName: "",
                        selectedFormat: options["Formato"] || product.formats?.[0] || "",
                        selectedFinish: options["Acabamento"] || product.finishes?.[0] || "",
                        selectedPrinting: options["Impressão"] || product.printing?.[0] || "",
                        selectedExtra: options["Extras"] || product.extras?.[0] || "",
                        selectedColor: "Branco",
                        customHex: "#7C3AED",
                        selectedVariations: initialVariations
                    };
                }
            });
            setCustomizations(initialCustomizations);
        }
    }, [combo, catalogProducts]);

    // Calculate dynamic pricing
    let calculatedOriginalPrice = 0;
    let allItemsMatched = true;
    if (combo && catalogProducts.length > 0) {
        combo.items.forEach(itemStr => {
            const { qty, product } = parseComboItem(itemStr, catalogProducts);
            if (product) {
                calculatedOriginalPrice += getProductPriceForQty(product, qty);
            } else {
                allItemsMatched = false;
            }
        });
    }

    const finalPrice = combo.price;
    const originalPrice = (allItemsMatched && calculatedOriginalPrice > 0)
        ? calculatedOriginalPrice
        : (combo.originalPrice || (combo as any).original_price);
    const discount = originalPrice > finalPrice ? Math.round((1 - (finalPrice / originalPrice)) * 100) : 0;

    const handleAddToCart = () => {
        if (!combo) return;

        // Validations
        for (let idx = 0; idx < combo.items.length; idx++) {
            const { qty, product } = parseComboItem(combo.items[idx], catalogProducts);
            if (!product) continue;
            
            const config = customizations[idx];
            if (!config) continue;
            
            const isCustomArtworkSelected = product.variations?.some(v => 
                (v.name.toLowerCase().includes("modelo") || v.name.toLowerCase().includes("template")) &&
                config.selectedVariations[v.name] === "Arte própria"
            ) || false;

            // Logo is required for all items (unless custom artwork selected)
            if (!isCustomArtworkSelected && !config.uploadedFile) {
                alert(`Por favor, envie a logo para o item "${product.title}".`);
                setExpandedItems(prev => ({ ...prev, [idx]: true }));
                return;
            }

            if (isCustomArtworkSelected && !config.artworkFile) {
                alert(`Por favor, envie o arquivo de arte própria para o item ${product.title}.`);
                setExpandedItems(prev => ({ ...prev, [idx]: true }));
                return;
            }

            if (product.customText?.fields && product.customText.fields.length > 0) {
                for (let fIdx = 0; fIdx < product.customText.fields.length; fIdx++) {
                    const field = product.customText.fields[fIdx];
                    if (field.required && !config.dynamicTextValues[fIdx]?.trim()) {
                        alert(`Por favor, preencha o campo "${field.label}" para o item ${product.title}.`);
                        setExpandedItems(prev => ({ ...prev, [idx]: true }));
                        return;
                    }
                }
            } else if (product.customText?.enabled && product.customText.required && !config.customTextValue?.trim() && !isCustomArtworkSelected) {
                alert(`Por favor, preencha as informações de personalização para o item ${product.title}.`);
                setExpandedItems(prev => ({ ...prev, [idx]: true }));
                return;
            }
        }

        // Serialize all product specs in the combo
        const serializedCustomizations: { [key: string]: any } = {};
        combo.items.forEach((itemStr, idx) => {
            const { qty, product } = parseComboItem(itemStr, catalogProducts);
            if (product) {
                const config = customizations[idx];
                serializedCustomizations[product.title] = {
                    qty,
                    productId: product.id,
                    purchaseMode: "simple",
                    selectedTemplate: config.selectedVariations[product.variations?.find(v => 
                        v.name.toLowerCase().includes("modelo") || 
                        v.name.toLowerCase().includes("template")
                    )?.name || "Modelo"] || config.selectedTemplate,
                    logoUrl: config.uploadedFile?.url,
                    logoName: config.uploadedFile?.name,
                    artworkUrl: config.artworkFile?.url,
                    artworkName: config.artworkFile?.name,
                    customText: product.customText?.fields && product.customText.fields.length > 0
                        ? product.customText.fields.map((f, fIdx) => `${f.label}: ${config.dynamicTextValues[fIdx] || "Não preenchido"}`).join("\n")
                        : config.customTextValue,
                    format: config.selectedFormat,
                    finish: config.selectedFinish,
                    printing: config.selectedPrinting,
                    extra: config.selectedExtra,
                    color: config.selectedColor
                };
            }
        });

        addToCart({
            productId: combo.id,
            title: combo.title,
            subtitle: "Combo Personalizado",
            price: finalPrice,
            quantity: 1,
            image: combo.image || "",
            details: {
                paper: "Multi-produto",
                finish: "Multi-acabamento",
                format: "Multi-formato",
                designOption: "upload",
                selectedVariations: selectedVariations,
                customizations: serializedCustomizations
            }
        });

        router.push("/carrinho");
    };

    const renderComboItemCustomizer = (idx: number, product: Product, config: typeof customizations[0]) => {
        const hasTemplates = product.variations?.some(v => 
            v.name.toLowerCase().includes("modelo") || 
            v.name.toLowerCase().includes("template")
        ) || false;

        const isCustomArtworkSelected = product.variations?.some(v => 
            (v.name.toLowerCase().includes("modelo") || v.name.toLowerCase().includes("template")) &&
            config.selectedVariations[v.name] === "Arte própria"
        ) || false;

        const updateConfig = (updater: Partial<typeof customizations[0]>) => {
            setCustomizations(prev => ({
                ...prev,
                [idx]: {
                    ...prev[idx],
                    ...updater
                }
            }));
        };

        const handleItemLogoUpload = async (file: File) => {
            updateConfig({ isUploadingLogo: true });
            try {
                const fileName = `${Date.now()}_combo_${idx}_logo_${file.name.replace(/\s+/g, '_')}`;
                const { data, error } = await supabase.storage
                    .from('client-uploads')
                    .upload(fileName, file);
                if (error) throw error;
                const { data: publicUrlData } = supabase.storage
                    .from('client-uploads')
                    .getPublicUrl(fileName);
                updateConfig({ uploadedFile: { name: file.name, url: publicUrlData.publicUrl } });
            } catch (err) {
                console.error(err);
                alert("Erro ao enviar arquivo.");
            } finally {
                updateConfig({ isUploadingLogo: false });
            }
        };

        const handleItemArtworkUpload = async (file: File) => {
            updateConfig({ isUploadingArtwork: true });
            try {
                const fileName = `${Date.now()}_combo_${idx}_artwork_${file.name.replace(/\s+/g, '_')}`;
                const { data, error } = await supabase.storage
                    .from('client-uploads')
                    .upload(fileName, file);
                if (error) throw error;
                const { data: publicUrlData } = supabase.storage
                    .from('client-uploads')
                    .getPublicUrl(fileName);
                updateConfig({ artworkFile: { name: file.name, url: publicUrlData.publicUrl } });
            } catch (err) {
                console.error(err);
                alert("Erro ao enviar arquivo.");
            } finally {
                updateConfig({ isUploadingArtwork: false });
            }
        };
        return (
            <div className="space-y-6">
                {/* Templates */}
                {product.variations?.filter(v => 
                    v.name.toLowerCase().includes("modelo") || 
                    v.name.toLowerCase().includes("template")
                ).map((variation, vIdx) => (
                    <div key={`combo-temp-${vIdx}`} className="space-y-3 pt-2 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Escolha seu {variation.name}</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {[...variation.options, "Arte própria"].map((option, oIdx) => {
                                const isSelected = config.selectedVariations[variation.name] === option;
                                const templateImg = variation.images?.[option];
                                
                                return (
                                    <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() => {
                                            updateConfig({
                                                selectedVariations: {
                                                    ...config.selectedVariations,
                                                    [variation.name]: option
                                                }
                                            });
                                            if (option === "Arte própria") {
                                                document.getElementById(`combo-artwork-input-${idx}-${vIdx}`)?.click();
                                            }
                                        }}
                                        className={cn(
                                            "min-w-[100px] max-w-[100px] group flex flex-col rounded-xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-sm flex-shrink-0 cursor-pointer",
                                            isSelected ? "border-brand ring-2 ring-brand/5" : "border-gray-200"
                                        )}
                                    >
                                        {option === "Arte própria" && (
                                            <input
                                                type="file"
                                                id={`combo-artwork-input-${idx}-${vIdx}`}
                                                className="hidden"
                                                accept=".pdf,.cdr,.ai,.psd,.jpg,.png,.jpeg"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleItemArtworkUpload(file);
                                                }}
                                            />
                                        )}
                                        
                                        <div className="aspect-[3/4] relative bg-gray-50 flex items-center justify-center">
                                            {option === "Arte própria" ? (
                                                config.isUploadingArtwork ? (
                                                    <div className="text-[10px] font-bold text-brand animate-pulse">Enviando...</div>
                                                ) : config.artworkFile ? (
                                                    <div className="text-[10px] font-bold text-green-600 flex flex-col items-center justify-center p-1 text-center">
                                                        <Check size={16} className="mb-0.5 text-green-600" />
                                                        <span className="truncate max-w-[80px] text-[8px]">{config.artworkFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[9px] font-semibold text-gray-500 text-center px-1 flex flex-col items-center">
                                                        <UploadCloud size={14} className="mb-1 text-gray-400" />
                                                        Upload
                                                    </div>
                                                )
                                            ) : templateImg ? (
                                                <Image src={templateImg} alt={option} fill className="object-cover transition-transform group-hover:scale-105" sizes="100px" />
                                            ) : (
                                                <span className="text-gray-300 italic text-[9px]">Sem prévia</span>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-gray-50 text-center truncate">
                                            <span className={cn("text-[10px] font-bold truncate block", isSelected ? "text-brand" : "text-gray-600")}>
                                                {option}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Upload de Logo e Campos de Texto */}
                {!isCustomArtworkSelected && (
                    <div className="space-y-4 pt-2 border-t border-gray-100 text-left">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Sua Logotipo</label>
                            {!config.uploadedFile ? (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id={`combo-logo-input-${idx}`}
                                        className="hidden"
                                        accept=".pdf,.cdr,.ai,.psd,.jpg,.png,.jpeg"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleItemLogoUpload(file);
                                        }}
                                    />
                                    <label
                                        htmlFor={`combo-logo-input-${idx}`}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-4 px-4 rounded-xl border border-dashed transition-all cursor-pointer text-center bg-white",
                                            config.isUploadingLogo 
                                                ? "border-brand bg-brand/5" 
                                                : "border-gray-200 hover:border-brand/30 hover:bg-gray-50"
                                        )}
                                    >
                                        <UploadCloud size={18} className={config.isUploadingLogo ? "text-brand animate-bounce" : "text-gray-400 mb-1"} />
                                        <p className="text-xs font-bold text-gray-700">
                                            {config.isUploadingLogo ? "Enviando..." : "Envie sua logo"}
                                        </p>
                                        <p className="text-[9px] text-gray-400 mt-0.5">Preferência por PDF ou PNG</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-green-800 truncate">{config.uploadedFile.name}</p>
                                            <p className="text-[9px] text-green-600">Enviada com sucesso</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => updateConfig({ uploadedFile: null })} 
                                        className="text-[10px] text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                    >
                                        Remover
                                    </button>
                                </div>
                            )}
                        </div>

                        {product.customText?.fields && product.customText.fields.length > 0 ? (
                            product.customText.fields.map((field, fIdx) => (
                                <div key={fIdx} className="space-y-1.5 pt-1">
                                    <label htmlFor={`combo-field-${idx}-${fIdx}`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea
                                        id={`combo-field-${idx}-${fIdx}`}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 text-xs focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3 bg-white"
                                        placeholder={field.placeholder || "Digite as informações aqui..."}
                                        value={config.dynamicTextValues[fIdx] || ""}
                                        onChange={(e) => updateConfig({
                                            dynamicTextValues: {
                                                ...config.dynamicTextValues,
                                                [fIdx]: e.target.value
                                            }
                                        })}
                                    />
                                </div>
                            ))
                        ) : (
                            <>
                                {product.customText?.enabled && (
                                    <div className="space-y-1.5 pt-1">
                                        <label htmlFor={`combo-text-${idx}`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {product.customText.label} {product.customText.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <textarea
                                            id={`combo-text-${idx}`}
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 text-xs focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3 bg-white"
                                            placeholder={product.customText.placeholder || "Digite as informações de personalização aqui..."}
                                            value={config.customTextValue}
                                            onChange={(e) => updateConfig({ customTextValue: e.target.value })}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Especificações Técnicas Selecionáveis pelo Cliente (Impressão e Cor Base) */}
                <div className="space-y-6 pt-4 border-t border-gray-100">
                    {/* Impressão - Desktop: match product page style */}
                    {product.printing && product.printing.length > 0 && (
                        <div className="space-y-3 md:space-y-4 text-left">
                            <div className="space-y-0.5">
                                <h3 className="text-sm md:text-lg font-semibold text-gray-900 tracking-tight">Impressão</h3>
                                <p className="text-[10px] md:text-xs text-gray-500">Defina os lados que serão impressos</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-5">
                                {product.printing.map((opt) => {
                                    const isSelected = config.selectedPrinting === opt;
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => updateConfig({ selectedPrinting: opt })}
                                            className={cn(
                                                "group flex flex-col rounded-xl border-2 transition-all text-left bg-white overflow-hidden shadow-sm cursor-pointer",
                                                isSelected 
                                                    ? "border-brand ring-4 ring-brand/5" 
                                                    : "border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            <VisualIllustration 
                                                type="print" 
                                                option={opt} 
                                                product={product} 
                                            />
                                            <div className="p-3 md:p-5 flex items-center justify-between w-full border-t border-gray-50">
                                                <div className="text-left min-w-0 pr-2">
                                                    <p className={cn("text-xs md:text-[13px] font-semibold leading-tight", isSelected ? "text-gray-900" : "text-gray-600")}>
                                                        {opt}
                                                    </p>
                                                    {product.printingPrices?.[opt] !== undefined && Number(product.printingPrices[opt]) > 0 && (
                                                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                            +{formatPrice(Number(product.printingPrices[opt]))}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                    isSelected ? "border-brand bg-brand" : "border-gray-200"
                                                )}>
                                                    {isSelected && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cor Base */}
                    {product.technicalSpecs?.enableColorSelector !== false && (
                        <div className="space-y-3 text-left pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cor Base</span>
                                {config.selectedColor.startsWith("Personalizado") && (
                                    <span className="text-[10px] text-brand font-semibold font-mono">
                                        Custom: {config.customHex}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {expandedColorsItem !== idx ? (
                                    <>
                                        {[
                                            { name: "Branco", hex: "#FFFFFF" },
                                            { name: "Bege / Kraft", hex: "#C2A37A" },
                                            { name: "Preto", hex: "#111827" },
                                            { name: "Azul Claro", hex: "#BAE6FD" },
                                            { name: "Cinza", hex: "#6B7280" }
                                        ].map((color) => {
                                            const isSelected = config.selectedColor === color.name;
                                            return (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => updateConfig({
                                                        selectedColor: color.name,
                                                        selectedVariations: {
                                                            ...config.selectedVariations,
                                                            "Cor Base": color.name
                                                        }
                                                    })}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 duration-200",
                                                        isSelected ? "ring-2 ring-brand ring-offset-1 scale-105" : ""
                                                    )}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                >
                                                    {isSelected && (
                                                        <Check 
                                                            size={10} 
                                                            strokeWidth={3} 
                                                            className={color.name === "Branco" ? "text-gray-900" : "text-white"} 
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedColorsItem(idx)}
                                            className="w-6 h-6 rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer shadow-xs hover:scale-105 duration-200"
                                            title="Mais cores"
                                        >
                                            <Plus size={10} className="text-gray-500" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { name: "Branco", hex: "#FFFFFF" },
                                            { name: "Bege / Kraft", hex: "#C2A37A" },
                                            { name: "Preto", hex: "#111827" },
                                            { name: "Azul Claro", hex: "#BAE6FD" },
                                            { name: "Cinza", hex: "#6B7280" },
                                            { name: "Azul Escuro", hex: "#1E3A8A" },
                                            { name: "Vermelho", hex: "#DC2626" },
                                            { name: "Verde", hex: "#15803D" },
                                            { name: "Amarelo", hex: "#EAB308" },
                                            { name: "Rosa", hex: "#EC4899" },
                                            { name: "Laranja", hex: "#F97316" },
                                            { name: "Roxo", hex: "#8B5CF6" },
                                            { name: "Personalizada", hex: "", isRainbow: true }
                                        ].map((color) => {
                                            const isSelected = color.isRainbow 
                                                ? config.selectedColor.startsWith("Personalizado")
                                                : config.selectedColor === color.name;
                                            
                                            if (color.isRainbow) {
                                                return (
                                                    <div
                                                        key={color.name}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 duration-200",
                                                            isSelected ? "ring-2 ring-brand ring-offset-1 scale-105" : ""
                                                        )}
                                                        style={{ 
                                                            background: "conic-gradient(from 180deg, red, yellow, green, cyan, blue, magenta, red)" 
                                                        }}
                                                        title={color.name}
                                                    >
                                                        <input 
                                                            type="color" 
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" 
                                                            value={config.customHex || "#7C3AED"} 
                                                            onChange={(e) => {
                                                                const hexCode = e.target.value;
                                                                updateConfig({
                                                                    selectedColor: `Personalizado (${hexCode})`,
                                                                    customHex: hexCode,
                                                                    selectedVariations: {
                                                                        ...config.selectedVariations,
                                                                        "Cor Base": `Personalizado (${hexCode})`
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                        {isSelected && (
                                                            <Check 
                                                                size={10} 
                                                                strokeWidth={3} 
                                                                className="text-white drop-shadow-xs pointer-events-none" 
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => updateConfig({
                                                        selectedColor: color.name,
                                                        selectedVariations: {
                                                            ...config.selectedVariations,
                                                            "Cor Base": color.name
                                                        }
                                                    })}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 duration-200",
                                                        isSelected ? "ring-2 ring-brand ring-offset-1 scale-105" : ""
                                                    )}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                >
                                                    {isSelected && (
                                                        <Check 
                                                            size={10} 
                                                            strokeWidth={3} 
                                                            className={color.name === "Branco" ? "text-gray-900" : "text-white"} 
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            type="button"
                                            onClick={() => setExpandedColorsItem(null)}
                                            className="text-[9px] font-bold text-brand hover:underline pl-1 cursor-pointer"
                                        >
                                            Fechar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detalhes Técnicos Pré-configurados (Exibidos em painel retrátil elegante) */}
                <div className="pt-2 border-t border-gray-100/60">
                    <button
                        type="button"
                        onClick={() => setShowSpecs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="w-full flex items-center justify-between text-xs border border-gray-150 rounded-xl p-3 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Info size={14} className="text-brand" />
                            Ver detalhes técnicos do item
                        </span>
                        {showSpecs[idx] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </button>

                    {showSpecs[idx] && (
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2 text-left space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                            {config.selectedFormat && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Formato</span>
                                    <span className="font-semibold text-gray-700">{config.selectedFormat}</span>
                                </div>
                            )}
                            {config.selectedFinish && (
                                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100/50">
                                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Acabamento</span>
                                    <span className="font-semibold text-gray-700">{config.selectedFinish}</span>
                                </div>
                            )}
                            {config.selectedExtra && (
                                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100/50">
                                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Extras</span>
                                    <span className="font-semibold text-gray-700">{config.selectedExtra}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            <Container className="pt-4 md:pt-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* COLUNA ESQUERDA: IMAGEM E DETALHES (Lg: 8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. IMAGEM DO COMBO */}
                        <div className="space-y-4">
                            <div className="aspect-[4/3] rounded-xl relative flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                {comboImages.length > 0 ? (
                                    <Image
                                        src={comboImages[activeImage] || comboImages[0]}
                                        alt={combo.title}
                                        fill
                                        className="object-cover animate-in fade-in zoom-in-95 duration-500"
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        priority
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <Package size={48} className="text-gray-300 mb-2" />
                                        <span className="text-sm font-medium">Sem imagem disponível</span>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {comboImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {comboImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveImage(idx);
                                            }}
                                            className={cn(
                                                "min-w-[80px] w-[80px] h-[80px] rounded-xl border-2 transition-all overflow-hidden relative bg-white shadow-sm",
                                                activeImage === idx
                                                    ? "border-brand ring-2 ring-brand/20"
                                                    : "border-transparent hover:border-gray-200"
                                            )}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. TÍTULO E DESCRIÇÃO (MOBILE ONLY) */}
                        <div className="lg:hidden space-y-6 px-1">
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">{combo.title}</h1>
                            {combo.subtitle && (
                                <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed text-[13px]">
                                    <p className={cn(!showFullDesc && "line-clamp-3")}>{combo.subtitle}</p>
                                    {combo.subtitle.length > 150 && (
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="text-brand font-medium text-[12px] mt-3 hover:underline inline-flex items-center gap-1 opacity-80"
                                        >
                                            {showFullDesc ? "Exibir menos" : "Exibir mais informações"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. ITENS INCLUSOS E CUSTOMIZAÇÃO */}
                        <section className="space-y-6 pt-6 border-t border-gray-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Itens Inclusos no Combo</h3>
                                <p className="text-xs text-gray-500">Configure e personalize cada item antes de comprar o combo</p>
                            </div>
                            
                            {loadingProducts ? (
                                <div className="py-12 flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {combo.items.map((itemStr, idx) => {
                                        const { qty, product } = parseComboItem(itemStr, catalogProducts);
                                        if (!product) return null;
                                        
                                        const isExpanded = !!expandedItems[idx];
                                        const config = customizations[idx];
                                        const productImg = product.image || (product.images && product.images[0]) || "";
                                        
                                        return (
                                            <div key={idx} className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
                                                {/* Header Card */}
                                                <div 
                                                    onClick={() => toggleExpandedItem(idx)}
                                                    className="flex items-center gap-4 p-5 cursor-pointer select-none"
                                                >
                                                    {/* Product Thumbnail */}
                                                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden flex-shrink-0">
                                                        {productImg ? (
                                                            <Image src={productImg} alt={product.title} fill className="object-cover" sizes="60px" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Product Title and Qty */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 truncate">{product.title}</h4>
                                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{qty.toLocaleString()} unidades</p>
                                                    </div>
                                                    
                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                                        <Link 
                                                            href={`/produto/${product.id}`}
                                                            target="_blank"
                                                            className="text-[11px] font-semibold text-gray-500 hover:text-white border border-gray-200 hover:border-[#15cb98] rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-all group relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[150px] hover:before:w-[150px] before:bg-[#15cb98]"
                                                        >
                                                            <span className="relative z-10 flex items-center gap-1">
                                                                Ver produto <ArrowUpRight size={12} className="text-gray-400 group-hover:text-white transition-colors" />
                                                            </span>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpandedItem(idx)}
                                                            className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Accordion Config Panel */}
                                                {isExpanded && config && (
                                                    <div className="border-t border-gray-50 bg-gray-50/20 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                                        {renderComboItemCustomizer(idx, product, config)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* COLUNA DIREITA: RESUMO E COMPRA (Lg: 4 cols) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        
                        {/* TÍTULO E SUBTÍTULO (DESKTOP ONLY) */}
                        <div className="hidden lg:block space-y-4 mb-4">
                            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{combo.title}</h1>
                            {combo.subtitle && (
                                <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed text-[13px]">
                                    <p className={cn(!showFullDesc && "line-clamp-3")}>{combo.subtitle}</p>
                                    {combo.subtitle.length > 150 && (
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="text-brand font-medium text-[12px] mt-2 hover:underline inline-flex items-center gap-1 opacity-80"
                                        >
                                            {showFullDesc ? "Exibir menos" : "Exibir mais informações"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Card 1: RESUMO DO PEDIDO E COMPRA */}
                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-8">
                            <div className="space-y-6 pt-2">
                                <div className="pt-6 space-y-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Resumo do Pedido
                                    </h2>
                                    
                                    <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-100/80">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Pacote</span>
                                            <span className="font-semibold text-gray-900">1x Combo Especial</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Soma dos Itens</span>
                                            <span className="font-semibold text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                                        </div>
                                        {originalPrice > finalPrice && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-medium">Desconto</span>
                                                <span className="font-semibold text-green-600">- {formatPrice(originalPrice - finalPrice)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-gray-200/60 flex justify-between items-end">
                                            <span className="text-gray-500 font-medium mb-0.5 text-xs">Valor do Combo</span>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 leading-none">{formatPrice(finalPrice)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={loadingProducts}
                                        className="w-full bg-brand text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-50 relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]"
                                    >
                                        <span className="relative z-10">Comprar Combo</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: GARANTIA E PRAZO SEALS */}
                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Check size={20} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Garantia de Produção</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Se houver erro de impressão causado pela produção, refazemos o material sem custo.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Truck size={20} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Prazo de Produção</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">O prazo começa a contar após aprovação da arte e confirmação do pagamento.</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: SUA CONFIGURAÇÃO */}
                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sua Configuração</p>
                            <div className="space-y-4">
                                {combo.items.map((itemStr, idx) => {
                                    const { qty, product } = parseComboItem(itemStr, catalogProducts);
                                    if (!product) return null;
                                    const config = customizations[idx];
                                    if (!config) return null;

                                    // Gather active specs for this item
                                    const specs: string[] = [];
                                    if (config.selectedFormat) specs.push(config.selectedFormat);
                                    if (config.selectedFinish) specs.push(config.selectedFinish);
                                    if (config.selectedPrinting) specs.push(config.selectedPrinting);
                                    if (config.selectedExtra) specs.push(config.selectedExtra);
                                    
                                    Object.entries(config.selectedVariations || {}).forEach(([name, val]) => {
                                        if (val && val !== "Branco" && val !== "Sem enobrecimento") {
                                            specs.push(val);
                                        }
                                    });

                                    return (
                                        <div key={idx} className="space-y-2 pb-3 border-b border-gray-50 last:border-b-0 last:pb-0">
                                            <p className="text-xs font-bold text-gray-800">{product.title}</p>
                                            <p className="text-[10px] text-gray-400 font-medium -mt-1">{qty.toLocaleString()} unidades</p>
                                            {specs.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {specs.map((spec, sIdx) => (
                                                        <span key={sIdx} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-semibold text-gray-600 uppercase tracking-tight">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Card 4: GABARITO (PDF) */}
                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-brand rounded-full"></div>
                                    Gabarito
                                </h3>
                                <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">PDF</span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Use nosso gabarito para garantir que sua arte esteja nas medidas corretas e com as margens de segurança adequadas.
                            </p>
                            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-100 transition-all font-semibold text-gray-700 hover:text-white text-xs group relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#15cb98] hover:border-[#15cb98]">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Download size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                    Baixar Gabarito
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            </Container>
        </div>
    );
}
