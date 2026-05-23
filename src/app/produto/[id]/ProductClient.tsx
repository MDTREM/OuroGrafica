"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, UploadCloud, Truck, Download, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";

interface ProductClientProps {
    product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    // Removed isLoading state as data comes from server

    const [quantity, setQuantity] = useState(100);
    const [selectedFormat, setSelectedFormat] = useState<string>("");
    const [selectedFinish, setSelectedFinish] = useState<string>("");
    const [selectedPrinting, setSelectedPrinting] = useState<string>("");
    const [selectedExtra, setSelectedExtra] = useState<string>("");
    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({});
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariationImage, setSelectedVariationImage] = useState<string | null>(null);
    const [designOption, setDesignOption] = useState<"upload" | "hire">("upload");
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Color Selector State
    const [selectedColor, setSelectedColor] = useState<string>("Branco");
    const [customHex, setCustomHex] = useState<string>("#7C3AED");
    const [showAllColors, setShowAllColors] = useState<boolean>(false);

    const handleColorSelect = (colorName: string, hexCode: string) => {
        setSelectedColor(colorName);
        if (colorName === "Personalizada") {
            setCustomHex(hexCode);
            setSelectedVariations(prev => ({ ...prev, "Cor Base": `Personalizado (${hexCode})` }));
        } else {
            setSelectedVariations(prev => ({ ...prev, "Cor Base": colorName }));
        }
    };

    // Alert Modal State
    const [showUploadAlert, setShowUploadAlert] = useState(false);
    const [showTextAlert, setShowTextAlert] = useState(false);
    const [showTextSecondaryAlert, setShowTextSecondaryAlert] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

    // Artwork Upload State
    const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);
    const [artworkFile, setArtworkFile] = useState<{ name: string; url: string } | null>(null);
    const [showArtworkAlert, setShowArtworkAlert] = useState(false);

    // Custom Dimensions State
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // in cm

    // Custom Text State
    const [customTextValue, setCustomTextValue] = useState("");
    const [customTextSecondaryValue, setCustomTextSecondaryValue] = useState("");
    const [dynamicTextValues, setDynamicTextValues] = useState<{ [key: number]: string }>({});

    const hasTemplates = product.variations?.some(v => 
        v.name.toLowerCase().includes("modelo") || 
        v.name.toLowerCase().includes("template")
    ) || false;

    const isCustomArtworkSelected = product.variations?.some(v => 
        (v.name.toLowerCase().includes("modelo") || v.name.toLowerCase().includes("template")) &&
        selectedVariations[v.name] === "Arte própria"
    ) || false;

    // Initial Quantity State Management
    useEffect(() => {
        if (product) {
            if (product.customQuantity && product.minQuantity) {
                setQuantity(product.minQuantity);
            } else if (!product.customQuantity && product.quantities && product.quantities.length > 0) {
                // Parse first quantity string to number
                const firstQty = parseInt(product.quantities[0].match(/\d+/)?.[0] || "100");
                setQuantity(firstQty);
            }
        }
    }, [product]);

    // Initialize defaults when product loads
    useEffect(() => {
        if (product) {
            if (product.formats?.[0]) setSelectedFormat(product.formats[0]);
            if (product.finishes?.[0]) setSelectedFinish(product.finishes[0]);
            if (product.printing?.[0]) setSelectedPrinting(product.printing[0]);
            if (product.extras?.[0]) setSelectedExtra(product.extras[0]);

            // Initialize dynamic variations
            const initialVariations: { [key: string]: string } = {
                "Cor Base": "Branco"
            };
            if (product.variations) {
                product.variations.forEach(v => {
                    if (v.options.length > 0) {
                        initialVariations[v.name] = v.options[0];
                    }
                });
            }
            setSelectedVariations(initialVariations);
        }
    }, [product]);

    const price = product.price || 0;
    const designPrice = designOption === "hire" ? 35.00 : 0;

    // Price Calculation Logic
    let calculatedBasePrice = 0;

    if (product?.allowCustomDimensions) {
        // Price per m² logic
        const area = (dimensions.width * dimensions.height) / 10000;
        calculatedBasePrice = (area > 0 ? area : 0) * price * quantity;
    } else if (product?.customQuantity) {
        // Simple Unit Price Logic
        calculatedBasePrice = price * quantity;
    } else {
        // Legacy/Batch Logic
        if (product.priceBreakdowns && product.priceBreakdowns[quantity]) {
            calculatedBasePrice = product.priceBreakdowns[quantity];
        } else {
            const quantityMultiplier = quantity / 100;
            calculatedBasePrice = price * (quantityMultiplier > 0 ? quantityMultiplier : 1);
        }
    }

    // Add Variation Prices
    let variationsAddon = 0;
    if (product.variations) {
        product.variations.forEach(v => {
            const selectedOption = selectedVariations[v.name];
            if (selectedOption && v.prices && v.prices[selectedOption]) {
                variationsAddon += v.prices[selectedOption];
            }
        });
    }

    const quantityMultiplierForAddon = (quantity / 100) > 0 ? (quantity / 100) : 1;
    const finalVariationsPrice = variationsAddon * quantityMultiplierForAddon;

    const formatPriceAddon = selectedFormat && product.formatPrices?.[selectedFormat] ? Number(product.formatPrices[selectedFormat]) : 0;
    const printingPriceAddon = selectedPrinting && product.printingPrices?.[selectedPrinting] ? Number(product.printingPrices[selectedPrinting]) : 0;
    const finishPriceAddon = selectedFinish && product.finishPrices?.[selectedFinish] ? Number(product.finishPrices[selectedFinish]) : 0;
    const extraPriceAddon = selectedExtra && product.extraPrices?.[selectedExtra] ? Number(product.extraPrices[selectedExtra]) : 0;

    const totalSpecAddons = formatPriceAddon + printingPriceAddon + finishPriceAddon + extraPriceAddon;

    const finalPrice = calculatedBasePrice + finalVariationsPrice + designPrice + totalSpecAddons;

    const productImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    // Menu Items State
    const [menuItems, setMenuItems] = useState<{ id: string; name: string; price: string }[]>([]);
    const [newItemName, setNewItemName] = useState("");

    // Helper functions for Menu Items
    const handleAddMenuItem = () => {
        if (!newItemName.trim()) return;
        setMenuItems(prev => [
            ...prev,
            { id: Date.now().toString(), name: newItemName.trim(), price: "" }
        ]);
        setNewItemName("");
    };

    const handleRemoveMenuItem = (id: string) => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateMenuItemPrice = (id: string, price: string) => {
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, price } : item));
    };

    // Serialize Menu Items to customTextValue
    useEffect(() => {
        if (product.customText?.menuItemsEnabled) {
            if (menuItems.length === 0) {
                setCustomTextValue("");
            } else {
                const serialized = menuItems
                    .map((item, idx) => {
                        const priceStr = item.price.trim() ? ` - R$ ${item.price.trim()}` : "";
                        return `${idx + 1}. ${item.name}${priceStr}`;
                    })
                    .join("\n");
                setCustomTextValue(serialized);
            }
        }
    }, [menuItems, product.customText?.menuItemsEnabled]);

    const handleAddToCart = () => {
        if (!product) return;


        if (isCustomArtworkSelected && !artworkFile) {
            setShowArtworkAlert(true);
            return;
        }

        if (designOption === "upload" && !uploadedFile && product.hasDesignOption !== false && !isCustomArtworkSelected) {
            setShowUploadAlert(true);
            return;
        }

        // Dynamic fields validation & serialization
        let compiledCustomText = customTextValue;
        let compiledCustomTextLabel = product.customText?.menuItemsEnabled 
            ? (product.customText?.menuItemsLabel || "Itens do Cardápio") 
            : product.customText?.label;

        if (product.customText?.fields && product.customText.fields.length > 0) {
            for (let fIdx = 0; fIdx < product.customText.fields.length; fIdx++) {
                const field = product.customText.fields[fIdx];
                if (field.required && !dynamicTextValues[fIdx]?.trim()) {
                    setShowTextAlert(true);
                    return;
                }
            }
            compiledCustomText = product.customText.fields
                .map((field, fIdx) => {
                    const val = dynamicTextValues[fIdx]?.trim() || "Não preenchido";
                    return `${field.label}: ${val}`;
                })
                .join("\n");
            compiledCustomTextLabel = "Especificações de Personalização";
        } else {
            // Legacy validations
            if (product.customText?.menuItemsEnabled && product.customText.menuItemsRequired && menuItems.length === 0) {
                setShowTextAlert(true);
                return;
            }

            if (product.customText?.enabled && product.customText.required && !customTextValue) {
                setShowTextAlert(true);
                return;
            }

            if (product.customText?.secondaryEnabled && product.customText.secondaryRequired && !customTextSecondaryValue) {
                setShowTextSecondaryAlert(true);
                return;
            }
        }

        addToCart({
            productId: product.id,
            title: product.title,
            subtitle: `${quantity} un.`,
            price: finalPrice / quantity,
            quantity: quantity,
            image: selectedVariationImage || productImages[0] || "",
            details: {
                paper: product.technicalSpecs?.paper || selectedVariations['Papel'] || selectedVariations['Material'] || "",
                format: selectedFormat,
                printing: selectedPrinting,
                finish: selectedFinish,
                extra: selectedExtra,
                designOption: designOption,
                dimensions: dimensions.width > 0 ? dimensions : undefined,
                selectedVariations: selectedVariations,
                fileUrl: uploadedFile?.url,
                fileName: uploadedFile?.name,
                customArtworkUrl: artworkFile?.url || undefined,
                customArtworkName: artworkFile?.name || undefined,
                customText: compiledCustomText || undefined,
                customTextSecondary: customTextSecondaryValue || undefined,
                customTextLabel: compiledCustomTextLabel,
                customTextSecondaryLabel: product.customText?.secondaryLabel
            }
        });

        router.push("/carrinho");
    };

    // Componente de Ilustração Visual
    const VisualIllustration = ({ type, option, manualType }: { type: "format" | "print", option: string, manualType?: string }) => {
        const finalManualType = manualType || product.optionIllustrations?.[option];
        
        const isRounded = finalManualType === 'rounded' || (!finalManualType && option.toLowerCase().includes("arredondado"));
        const isFrontAndBack = finalManualType === 'front_back' || (!finalManualType && (option.toLowerCase().includes("frente e verso") || option.toLowerCase().includes("f/v")));
        const isRectangular = finalManualType === 'rectangular' || (!finalManualType && option.toLowerCase().includes("retangular"));
        const isFrontOnly = finalManualType === 'front' || (!finalManualType && !isFrontAndBack && (option.toLowerCase().includes("frente") || option.toLowerCase().includes("4x0")));

        if (type === "format" || finalManualType === 'rectangular' || finalManualType === 'rounded') {
            return (
                <div className="w-full aspect-[16/10] bg-gray-50 flex items-center justify-center p-4">
                    <div className={cn(
                        "w-3/4 h-3/4 border-2 border-gray-400 flex items-center justify-center transition-all duration-500",
                        isRounded ? "rounded-xl" : "rounded-xl"
                    )}>
                        <div className={cn(
                            "w-1/2 h-1/2 border border-gray-300 transition-all duration-500",
                            isRounded ? "rounded-xl" : "rounded-xs"
                        )} />
                    </div>
                </div>
            );
        }

        if (type === "print" || finalManualType === 'front' || finalManualType === 'front_back') {
            return (
                <div className="w-full aspect-[16/10] bg-gray-50 flex items-center justify-center p-4 gap-2">
                    {/* Frente */}
                    <div className="w-16 h-20 border-2 border-gray-400 rounded-xl flex items-center justify-center text-gray-500 font-semibold text-lg bg-white">
                        F
                    </div>
                    {/* Verso */}
                    <div className={cn(
                        "w-16 h-20 border-2 rounded-xl flex items-center justify-center text-gray-500 font-semibold text-lg",
                        isFrontAndBack ? "border-gray-400 bg-white" : "border-gray-200 bg-gray-100/50"
                    )}>
                        {isFrontAndBack ? "V" : ""}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            <Container className="pt-4 md:pt-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* COLUNA ESQUERDA: IMAGENS E CONFIGURAÇÕES (Lg: 8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. SEÇÃO DE IMAGENS */}
                        <div className="space-y-4">
                            <div className="aspect-[16/9] rounded-xl relative flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                {productImages.length > 0 || selectedVariationImage ? (
                                    <Image
                                        src={selectedVariationImage || productImages[activeImage] || productImages[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover animate-in fade-in zoom-in-95 duration-500"
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        priority
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <span className="text-6xl mb-2">📷</span>
                                        <span className="text-sm font-medium">Sem imagem disponível</span>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {productImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {productImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveImage(idx);
                                                setSelectedVariationImage(null);
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

                        {/* 2. TÍTULO E DESCRIÇÃO (MOBILE ONLY - BELOW PHOTOS) */}
                        <div className="lg:hidden space-y-6 px-1">
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">{product.title}</h1>
                            <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed text-[13px]">
                                <p className={cn(!showFullDesc && "line-clamp-3")}>{product.description}</p>
                                {product.description && product.description.length > 150 && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="text-brand font-medium text-[12px] mt-3 hover:underline inline-flex items-center gap-1 opacity-80"
                                    >
                                        {showFullDesc ? "Exibir menos" : "Exibir mais informações"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 3. SEÇÃO DE TEMPLATES / MODELOS (NOVO) */}
                        {product.variations?.filter(v => 
                            v.name.toLowerCase().includes("modelo") || 
                            v.name.toLowerCase().includes("template")
                        ).map((variation, vIdx) => (
                            <section key={`template-${vIdx}`} className="space-y-6 pt-6 border-t border-gray-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Escolha seu {variation.name}</h3>
                                        <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Diferencial Vink</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Selecione um design pronto para personalizar com sua marca</p>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {[...variation.options, "Arte própria"].map((option, oIdx) => {
                                        const isSelected = selectedVariations[variation.name] === option;
                                        const templateImg = variation.images?.[option];
                                        
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={(e) => {
                                                    if ((e.target as HTMLElement).closest('.remove-artwork-btn')) {
                                                        return;
                                                    }
                                                    setSelectedVariations(prev => ({ ...prev, [variation.name]: option }));
                                                    if (option === "Arte própria") {
                                                        setSelectedVariationImage(null);
                                                        document.getElementById(`template-artwork-input-${vIdx}`)?.click();
                                                    } else if (templateImg) {
                                                        setSelectedVariationImage(templateImg);
                                                        const imgIndex = productImages.findIndex(img => img === templateImg);
                                                        if (imgIndex !== -1) setActiveImage(imgIndex);
                                                    }
                                                }}
                                                className={cn(
                                                    "group relative flex flex-col rounded-xl border-2 transition-all overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 duration-300",
                                                    isSelected ? "border-brand ring-4 ring-brand/5 shadow-lg shadow-brand/10" : "border-gray-100"
                                                )}
                                            >
                                                {option === "Arte própria" && (
                                                    <input
                                                        type="file"
                                                        id={`template-artwork-input-${vIdx}`}
                                                        className="hidden"
                                                        accept=".pdf,.cdr,.ai,.psd,.jpg,.png,.jpeg"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setIsUploadingArtwork(true);
                                                            try {
                                                                const fileName = `${Date.now()}_artwork_${file.name.replace(/\s+/g, '_')}`;
                                                                const { data, error } = await supabase.storage
                                                                    .from('client-uploads')
                                                                    .upload(fileName, file);
                                                                if (error) throw error;
                                                                const { data: publicUrlData } = supabase.storage
                                                                    .from('client-uploads')
                                                                    .getPublicUrl(fileName);
                                                                setArtworkFile({ name: file.name, url: publicUrlData.publicUrl });
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert("Erro ao enviar arquivo.");
                                                            } finally {
                                                                setIsUploadingArtwork(false);
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <div className="aspect-[3/4] relative bg-gray-50">
                                                    {option === "Arte própria" ? (
                                                        isUploadingArtwork ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-brand/5 text-brand animate-pulse">
                                                                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center mb-2 animate-bounce">
                                                                    <UploadCloud size={22} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-center">
                                                                    Enviando...
                                                                </span>
                                                            </div>
                                                        ) : artworkFile ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-green-50/50 text-green-700 hover:text-green-800 transition-colors duration-300">
                                                                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mb-2 shadow-md shadow-green-500/10">
                                                                    <Check size={22} strokeWidth={3} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-center leading-tight max-w-[90px] truncate mb-1">
                                                                    {artworkFile.name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setArtworkFile(null);
                                                                    }}
                                                                    className="remove-artwork-btn text-[9px] text-red-500 font-bold hover:bg-red-50 px-2 py-0.5 rounded transition-colors animate-all"
                                                                >
                                                                    Remover
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className={cn(
                                                                "w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50/50 text-gray-500 hover:text-brand transition-colors duration-300",
                                                                isSelected ? "bg-brand/5" : ""
                                                            )}>
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300",
                                                                    isSelected ? "bg-brand text-white shadow-md shadow-brand/10" : "bg-gray-100 text-gray-400 group-hover:text-brand group-hover:bg-brand/10"
                                                                )}>
                                                                    <UploadCloud size={22} />
                                                                </div>
                                                                <span className="text-[10px] font-semibold text-center leading-normal max-w-[80px]">
                                                                    Upload de arte
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : templateImg ? (
                                                        <Image src={templateImg} alt={option} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px]">Sem prévia</div>
                                                    )}
                                                    
                                                    {isSelected && !artworkFile && !isUploadingArtwork && (
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-300">
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 text-center border-t border-gray-50 bg-gray-50/30">
                                                    <span className={cn(
                                                        "text-[11px] font-bold tracking-wider",
                                                        isSelected ? "text-brand" : "text-gray-500"
                                                    )}>
                                                        {option}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}

                        {/* 4. OPÇÕES TÉCNICAS (FORMATO, ACABAMENTO, VARIATIONS) */}
                        <div className="space-y-16 pt-10 border-t border-gray-100/60">

                            {/* Formato */}
                            {product.formats && product.formats.length > 0 && (
                                <section className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Formato</h3>
                                            <p className="text-xs text-gray-500">Escolha aqui o tamanho do seu material</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                                        {product.formats.map((fmt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedFormat(fmt)}
                                                className={cn(
                                                    "group flex flex-col rounded-xl border-2 transition-all overflow-hidden bg-white shadow-sm",
                                                    selectedFormat === fmt ? "border-brand ring-4 ring-brand/5" : "border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <VisualIllustration type="format" option={fmt} manualType={product.optionIllustrations?.[fmt]} />
                                                <div className="p-5 flex items-center justify-between border-t border-gray-50">
                                                    <div className="text-left">
                                                        <p className={cn("text-[13px] font-semibold leading-tight pr-4", selectedFormat === fmt ? "text-gray-900" : "text-gray-600")}>
                                                            {fmt}
                                                        </p>
                                                        {product.formatPrices?.[fmt] !== undefined && Number(product.formatPrices[fmt]) > 0 && (
                                                            <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                                +{formatPrice(Number(product.formatPrices[fmt]))}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                                        selectedFormat === fmt ? "border-brand bg-brand" : "border-gray-200"
                                                    )}>
                                                        {selectedFormat === fmt && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Impressão */}
                            {product.printing && product.printing.length > 0 && (
                                <section className="space-y-8">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Impressão</h3>
                                        <p className="text-xs text-gray-500">Defina os lados que serão impressos</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                                        {product.printing.map((prt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedPrinting(prt)}
                                                className={cn(
                                                    "group flex flex-col rounded-xl border-2 transition-all overflow-hidden bg-white shadow-sm",
                                                    selectedPrinting === prt ? "border-brand ring-4 ring-brand/5" : "border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <VisualIllustration type="print" option={prt} />
                                                <div className="p-5 flex items-center justify-between border-t border-gray-50">
                                                    <div className="text-left">
                                                        <p className={cn("text-[13px] font-semibold leading-tight pr-4", selectedPrinting === prt ? "text-gray-900" : "text-gray-600")}>
                                                            {prt}
                                                        </p>
                                                        {product.printingPrices?.[prt] !== undefined && Number(product.printingPrices[prt]) > 0 && (
                                                            <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                                +{formatPrice(Number(product.printingPrices[prt]))}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                                        selectedPrinting === prt ? "border-brand bg-brand" : "border-gray-200"
                                                    )}>
                                                        {selectedPrinting === prt && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Acabamento */}
                            {product.finishes && product.finishes.length > 0 && (
                                <section className="space-y-8">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Acabamento</h3>
                                        <p className="text-xs text-gray-500">Toque final para o seu material</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                                        {product.finishes.map((fin, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedFinish(fin)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 md:p-6 rounded-xl border-2 transition-all text-left bg-white shadow-sm",
                                                    selectedFinish === fin
                                                        ? "border-brand bg-white ring-4 ring-brand/5"
                                                        : "border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <div className="text-left">
                                                    <p className={cn("text-[13px] font-semibold", selectedFinish === fin ? "text-gray-900" : "text-gray-600")}>
                                                        {fin}
                                                    </p>
                                                    {product.finishPrices?.[fin] !== undefined && Number(product.finishPrices[fin]) > 0 && (
                                                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                            +{formatPrice(Number(product.finishPrices[fin]))}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0", selectedFinish === fin ? "border-brand bg-brand" : "border-gray-200")}>
                                                    {selectedFinish === fin && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Extras */}
                            {product.extras && product.extras.length > 0 && (
                                <section className="space-y-8">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Extras</h3>
                                        <p className="text-xs text-gray-500">Adicionais para o seu material</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                                        {product.extras.map((ext, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedExtra(ext)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 md:p-6 rounded-xl border-2 transition-all text-left bg-white shadow-sm",
                                                    selectedExtra === ext
                                                        ? "border-brand bg-white ring-4 ring-brand/5"
                                                        : "border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <div className="text-left">
                                                    <p className={cn("text-[13px] font-semibold", selectedExtra === ext ? "text-gray-900" : "text-gray-600")}>
                                                        {ext}
                                                    </p>
                                                    {product.extraPrices?.[ext] !== undefined && Number(product.extraPrices[ext]) > 0 && (
                                                        <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                            +{formatPrice(Number(product.extraPrices[ext]))}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0", selectedExtra === ext ? "border-brand bg-brand" : "border-gray-200")}>
                                                    {selectedExtra === ext && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Cor Base */}
                            {product.technicalSpecs?.enableColorSelector !== false && (
                                <section className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Cor Base</h3>
                                        <p className="text-xs text-gray-500">Selecione a cor principal do seu material</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        {!showAllColors ? (
                                            <>
                                                {/* Render 5 Base Colors */}
                                                {[
                                                    { name: "Branco", hex: "#FFFFFF" },
                                                    { name: "Bege / Kraft", hex: "#C2A37A" },
                                                    { name: "Preto", hex: "#111827" },
                                                    { name: "Azul Claro", hex: "#BAE6FD" },
                                                    { name: "Cinza", hex: "#6B7280" }
                                                ].map((color) => {
                                                    const isSelected = selectedColor === color.name;
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            type="button"
                                                            onClick={() => handleColorSelect(color.name, color.hex)}
                                                            className={cn(
                                                                "w-11 h-11 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 duration-200",
                                                                isSelected ? "ring-2 ring-brand ring-offset-2 scale-105 border-white border-2" : ""
                                                            )}
                                                            style={{ backgroundColor: color.hex }}
                                                            title={color.name}
                                                            aria-label={`Selecionar cor ${color.name}`}
                                                        >
                                                            {isSelected && (
                                                                <Check 
                                                                    size={16} 
                                                                    strokeWidth={3} 
                                                                    className={color.name === "Branco" ? "text-gray-900" : "text-white"} 
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllColors(true)}
                                                    className="w-11 h-11 rounded-full border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 relative flex items-center justify-center transition-all cursor-pointer hover:scale-105 duration-200"
                                                    title="Ver outras opções de cores"
                                                    aria-label="Ver outras opções de cores"
                                                >
                                                    <Plus size={16} className="text-gray-500" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Render All 13 Colors */}
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
                                                    const isSelected = selectedColor === color.name;
                                                    if (color.isRainbow) {
                                                        return (
                                                            <div
                                                                key={color.name}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 duration-200",
                                                                    isSelected ? "ring-2 ring-brand ring-offset-2 scale-105 border-white border-2" : ""
                                                                )}
                                                                style={{ 
                                                                    background: "conic-gradient(from 180deg, red, yellow, green, cyan, blue, magenta, red)" 
                                                                }}
                                                                title={color.name}
                                                            >
                                                                <input 
                                                                    type="color" 
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" 
                                                                    value={customHex} 
                                                                    onChange={(e) => handleColorSelect("Personalizada", e.target.value)}
                                                                />
                                                                {isSelected && (
                                                                    <Check 
                                                                        size={14} 
                                                                        strokeWidth={3} 
                                                                        className="text-white drop-shadow pointer-events-none" 
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            type="button"
                                                            onClick={() => handleColorSelect(color.name, color.hex)}
                                                            className={cn(
                                                                "w-10 h-10 rounded-full border border-gray-200 relative flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 duration-200",
                                                                isSelected ? "ring-2 ring-brand ring-offset-2 scale-105 border-white border-2" : ""
                                                            )}
                                                            style={{ 
                                                                background: color.hex 
                                                            }}
                                                            title={color.name}
                                                            aria-label={`Selecionar cor ${color.name}`}
                                                        >
                                                            {isSelected && (
                                                                <Check 
                                                                    size={14} 
                                                                    strokeWidth={3} 
                                                                    className="text-white drop-shadow" 
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}

                                                {/* Collapse Trigger Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllColors(false)}
                                                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:text-brand hover:border-brand/40 transition-all cursor-pointer hover:scale-105 duration-200"
                                                    title="Recolher opções adicionais"
                                                    aria-label="Recolher opções adicionais"
                                                >
                                                    <span className="text-xs font-bold font-sans">✕</span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Redesigned Premium Custom Color Configurator */}
                                    {selectedColor === "Personalizada" && (
                                        <div className="flex items-center gap-3.5 mt-4 p-3 bg-gray-50/60 border border-gray-100 rounded-xl max-w-[240px] animate-in fade-in duration-300 shadow-inner">
                                            <div 
                                                className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm cursor-pointer shrink-0 transition-transform hover:scale-105 relative"
                                                style={{ backgroundColor: customHex }}
                                                title="Clique para escolher uma cor personalizada"
                                            >
                                                <input 
                                                    type="color" 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-lg" 
                                                    value={customHex} 
                                                    onChange={(e) => handleColorSelect("Personalizada", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5 select-none">Cor Personalizada</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-400 font-mono text-sm font-semibold select-none">#</span>
                                                    <input 
                                                        type="text" 
                                                        maxLength={6}
                                                        className="block w-full bg-transparent text-sm font-bold font-mono text-gray-800 focus:outline-none uppercase"
                                                        value={customHex.replace('#', '')}
                                                        onChange={(e) => {
                                                            let val = e.target.value;
                                                            handleColorSelect("Personalizada", `#${val}`);
                                                        }}
                                                        placeholder="7C3AED"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Dynamic Variations (Excludes Templates already shown above) */}
                            {product.variations && product.variations
                                .filter(v => !v.name.toLowerCase().includes("modelo") && !v.name.toLowerCase().includes("template"))
                                .map((variation, vIdx) => {
                                const isPrintVariation = variation.name.toLowerCase().includes("impressão") || variation.name.toLowerCase().includes("cores");
                                
                                return (
                                    <section key={vIdx} className="space-y-8">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{variation.name}</h3>
                                            <p className="text-xs text-gray-500">Confira como será aplicado</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            {variation.options.map((option, oIdx) => {
                                                const isSelected = selectedVariations[variation.name] === option;
                                                const varImage = variation.images?.[option];
                                                const priceAddon = variation.prices?.[option] || 0;
                                                const manualType = variation.illustrations?.[option];

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => {
                                                            setSelectedVariations(prev => ({ ...prev, [variation.name]: option }));
                                                            if (varImage) {
                                                                setSelectedVariationImage(varImage);
                                                                const imgIndex = productImages.findIndex(img => img === varImage);
                                                                if (imgIndex !== -1) setActiveImage(imgIndex);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "group flex flex-col rounded-xl border-2 transition-all overflow-hidden bg-white shadow-sm",
                                                            isSelected ? "border-brand ring-4 ring-brand/5 shadow-md" : "border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        {manualType || isPrintVariation ? (
                                                            <VisualIllustration 
                                                                type={isPrintVariation ? "print" : "format"} 
                                                                option={option} 
                                                                manualType={manualType} 
                                                            />
                                                        ) : (
                                                            <div className="aspect-video relative bg-gray-50 flex items-center justify-center">
                                                                {varImage ? (
                                                                    <Image src={varImage} alt={option} fill className="object-contain p-2" sizes="200px" />
                                                                ) : (
                                                                    <span className="text-gray-300 font-semibold text-[10px] uppercase tracking-widest">{option}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="p-4 flex items-center justify-between border-t border-gray-50">
                                                            <div className="text-left">
                                                                <p className={cn("text-[13px] font-semibold", isSelected ? "text-gray-900" : "text-gray-600")}>{option}</p>
                                                                {priceAddon > 0 && <p className="text-[10px] text-green-600 font-semibold">+{formatPrice(priceAddon)}</p>}
                                                            </div>
                                                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0", isSelected ? "border-black bg-black" : "border-gray-200")}>
                                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
 
                            {/* Quantidade (Agora em destaque) */}
                            {!product.customQuantity && (
                                <section id="quantidade-section" className="space-y-8">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Quantidade e Preço</h3>
                                        <p className="text-xs text-gray-500">Escolha a tiragem ideal para o seu projeto</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                                        {(product.quantities || Object.keys(product.priceBreakdowns || []))
                                            .sort((a, b) => {
                                                const aVal = typeof a === 'string' ? parseInt(a.match(/\d+/)?.[0] || "0") : Number(a);
                                                const bVal = typeof b === 'string' ? parseInt(b.match(/\d+/)?.[0] || "0") : Number(b);
                                                return aVal - bVal;
                                            })
                                            .map((qty, idx) => {
                                                const qtyValue = typeof qty === 'string' ? parseInt(qty.match(/\d+/)?.[0] || "0") : Number(qty);
                                                let cardTotalPrice = 0;
                                                if (product.priceBreakdowns && product.priceBreakdowns[qtyValue]) {
                                                    cardTotalPrice = product.priceBreakdowns[qtyValue];
                                                } else {
                                                    cardTotalPrice = (product.price || 0) * (qtyValue / 100);
                                                }
                                                const cardUnitPrice = cardTotalPrice / qtyValue;
                                                const isSelected = quantity === qtyValue;

                                                let discount = 0;
                                                const firstQtyKey = (product.quantities || Object.keys(product.priceBreakdowns || []))[0];
                                                const firstQtyVal = typeof firstQtyKey === 'string' ? parseInt(firstQtyKey.match(/\d+/)?.[0] || "1") : Number(firstQtyKey);
                                                const firstTotalPrice = product.priceBreakdowns?.[firstQtyVal] || (product.price || 0) * (firstQtyVal / 100);
                                                const firstUnitPrice = firstTotalPrice / firstQtyVal;

                                                if (idx > 0 && firstUnitPrice > cardUnitPrice) {
                                                    discount = Math.round((1 - (cardUnitPrice / firstUnitPrice)) * 100);
                                                }

                                                return (
                                                    <button
                                                        key={qty}
                                                        onClick={() => setQuantity(qtyValue)}
                                                        className={cn(
                                                            "flex items-center justify-between p-4 md:p-6 rounded-xl border transition-all text-left",
                                                            isSelected ? "border-brand bg-brand/5 shadow-md ring-4 ring-brand/10" : "border-gray-100 hover:border-gray-200 bg-white shadow-sm"
                                                        )}
                                                    >
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("text-[14px] font-semibold", isSelected ? "text-brand" : "text-gray-900")}>{qtyValue.toLocaleString()} unidades</span>
                                                                {discount > 0 && <span className="bg-green-100 text-green-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">-{discount}%</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[12px] font-medium text-gray-400">
                                                                <span className={isSelected ? "text-brand" : "text-gray-900"}>{formatPrice(cardTotalPrice)}</span>
                                                                <span>{formatPrice(cardUnitPrice).replace('R$', '').trim()} / un.</span>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", isSelected ? "border-brand bg-brand" : "border-gray-200")}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DIREITA: RESUMO E COMPRA (Lg: 4 cols - STICKY) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        {/* 2. TÍTULO E DESCRIÇÃO (DESKTOP ONLY) */}
                        <div className="hidden lg:block space-y-4 mb-4">
                            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{product.title}</h1>
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                <p className={cn(!showFullDesc && "line-clamp-3")}>{product.description}</p>
                                {product.description && product.description.length > 150 && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="text-brand font-semibold text-sm mt-2 hover:underline inline-flex items-center gap-1"
                                    >
                                        {showFullDesc ? "Exibir menos" : "Exibir mais informações"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-8">


                            {/* Info List */}
                            <div className="space-y-6 pt-2">
                                <div className="space-y-3">
                                    {!isCustomArtworkSelected && (
                                        !uploadedFile ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    id="sidebar-upload"
                                                    className="hidden"
                                                    accept=".pdf,.cdr,.ai,.psd,.jpg,.png,.jpeg"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUploading(true);
                                                        try {
                                                            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                                                            const { data, error } = await supabase.storage
                                                                .from('client-uploads')
                                                                .upload(fileName, file);
                                                            if (error) throw error;
                                                            const { data: publicUrlData } = supabase.storage
                                                                .from('client-uploads')
                                                                .getPublicUrl(fileName);
                                                            setUploadedFile({ name: file.name, url: publicUrlData.publicUrl });
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert("Erro ao enviar arquivo.");
                                                        } finally {
                                                            setIsUploading(false);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="sidebar-upload"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center py-3.5 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-1.5",
                                                        isUploading 
                                                            ? "border-brand bg-brand/5" 
                                                            : "border-gray-100 bg-white hover:bg-gray-50 hover:border-brand/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                                        isUploading ? "bg-brand text-white" : "bg-white text-brand"
                                                    )}>
                                                        <UploadCloud size={16} strokeWidth={1.5} />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {isUploading ? "Enviando..." : "Envie sua logo"}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400">
                                                            Preferência por PDF, PNG ou JPG (Máx. 25MB)
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-300">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                                        <Check size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-green-800 truncate">{uploadedFile.name}</p>
                                                        <p className="text-[9px] text-green-600">{hasTemplates ? "Logo enviada com sucesso!" : "Arte própria enviada com sucesso!"}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setUploadedFile(null)} 
                                                    className="text-[10px] text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        )
                                    )}
                                    {product.customText?.menuItemsEnabled && (
                                        <div className="space-y-4 pt-3 border-t border-gray-100/50 animate-in fade-in duration-300">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {product.customText.menuItemsLabel || "Itens do Cardápio"} {product.customText.menuItemsRequired && <span className="text-red-500">*</span>}
                                                </label>
                                                <p className="text-[11px] text-gray-400">
                                                    Adicione os itens e seus respectivos valores abaixo.
                                                </p>
                                            </div>
                                            
                                            {/* Add Item Form */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={product.customText.menuItemsPlaceholder || "Ex: Pizza de Calabresa..."}
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddMenuItem();
                                                        }
                                                    }}
                                                    className="flex-1 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 px-3 py-2.5 bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddMenuItem}
                                                    className="bg-brand hover:bg-brand-dark text-white font-semibold px-3 py-2.5 md:px-4 md:py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                                                    title="Adicionar item"
                                                >
                                                    <Plus size={16} />
                                                    <span className="hidden md:inline">Adicionar</span>
                                                </button>
                                            </div>

                                            {/* Items List */}
                                            {menuItems.length > 0 && (
                                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                    {menuItems.map((item, idx) => (
                                                        <div 
                                                            key={item.id} 
                                                            className="flex items-center gap-3 bg-gray-50 border border-gray-200/60 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200"
                                                        >
                                                            <span className="text-xs font-semibold text-gray-400 shrink-0">
                                                                #{idx + 1}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {item.name}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className="text-xs font-medium text-gray-500">R$</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="0,00"
                                                                    value={item.price}
                                                                    onChange={(e) => handleUpdateMenuItemPrice(item.id, e.target.value)}
                                                                    className="w-20 rounded-lg border-gray-200 text-xs text-right focus:border-brand focus:ring-brand p-1.5 shrink-0 bg-white"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveMenuItem(item.id)}
                                                                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {product.customText?.fields && product.customText.fields.length > 0 ? (
                                        product.customText.fields.map((field, fIdx) => (
                                            <div key={fIdx} className="space-y-2 pt-3 border-t border-gray-100/50 animate-in fade-in duration-300">
                                                <label htmlFor={`dynamic-field-${fIdx}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <textarea
                                                    id={`dynamic-field-${fIdx}`}
                                                    rows={3}
                                                    className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3 bg-white"
                                                    placeholder={field.placeholder || "Digite as informações aqui..."}
                                                    value={dynamicTextValues[fIdx] || ""}
                                                    onChange={(e) => setDynamicTextValues(prev => ({ ...prev, [fIdx]: e.target.value }))}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {product.customText?.enabled && !product.customText?.menuItemsEnabled && (
                                                <div className="space-y-2 pt-3 border-t border-gray-100/50 animate-in fade-in duration-300">
                                                    <label htmlFor="custom-text-input" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                        {product.customText.label} {product.customText.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <textarea
                                                        id="custom-text-input"
                                                        rows={4}
                                                        className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3"
                                                        placeholder={product.customText.placeholder || "Digite as informações de personalização aqui..."}
                                                        value={customTextValue}
                                                        onChange={(e) => setCustomTextValue(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            {product.customText?.secondaryEnabled && (
                                                <div className="space-y-2 pt-3 border-t border-gray-100/50 animate-in fade-in duration-300">
                                                    <label htmlFor="custom-text-secondary-input" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                        {product.customText.secondaryLabel} {product.customText.secondaryRequired && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <textarea
                                                        id="custom-text-secondary-input"
                                                        rows={4}
                                                        className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3"
                                                        placeholder={product.customText.secondaryPlaceholder || "Digite as informações secundárias aqui..."}
                                                        value={customTextSecondaryValue}
                                                        onChange={(e) => setCustomTextSecondaryValue(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Resumo do Pedido, Preço Final e Botão de Comprar */}
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Resumo do Pedido
                                    </h2>
                                    
                                    <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-100/80">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Quantidade</span>
                                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                                                {quantity.toLocaleString()} un.
                                                <button 
                                                    onClick={() => document.getElementById('quantidade-section')?.scrollIntoView({ behavior: 'smooth' })}
                                                    className="text-brand hover:bg-brand/10 p-1 rounded-full transition-colors"
                                                    title="Editar quantidade"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Preço unitário (base)</span>
                                            <span className="text-gray-400 font-medium">{formatPrice((calculatedBasePrice + finalVariationsPrice) / (quantity || 1))}</span>
                                        </div>
                                        {totalSpecAddons + designPrice > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-medium">Opções adicionais</span>
                                                <span className="text-green-600 font-semibold">+{formatPrice(totalSpecAddons + designPrice)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-gray-200/60 flex justify-between items-end">
                                            <span className="text-gray-500 font-medium mb-0.5 text-xs">Total à vista</span>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 leading-none">{formatPrice(finalPrice)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand/20 active:scale-[0.98] group"
                                    >
                                        Comprar Agora
                                    </button>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            <Check size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Garantia de Qualidade</p>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Reimpressão grátis em caso de erros.</p>
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
                            </div>

                            {/* Tags de Resumo */}
                            <div className="pt-6 border-t border-gray-50">
                                <p className="text-xs font-semibold text-gray-500 mb-4">Sua Configuração</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{quantity} UNID</span>
                                    {selectedFormat && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{selectedFormat}</span>}
                                    {selectedPrinting && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{selectedPrinting}</span>}
                                    {selectedFinish && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{selectedFinish}</span>}
                                    {selectedExtra && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{selectedExtra}</span>}
                                    {dimensions.width > 0 && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{dimensions.width}x{dimensions.height}CM</span>}
                                    {designOption === "hire" && <span className="px-3 py-1 bg-brand/10 rounded-full text-[10px] font-semibold text-brand uppercase tracking-tight">Criação de Arte</span>}
                                    {customTextValue && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">Texto Pers.</span>}
                                    {customTextSecondaryValue && <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">Texto Sec.</span>}
                                    {Object.values(selectedVariations).map((val, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 uppercase tracking-tight">{val}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Baixar Gabarito Section */}
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
                            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-100 hover:border-brand hover:bg-brand/5 hover:text-brand transition-all font-semibold text-gray-700 text-xs group">
                                <Download size={16} className="text-gray-400 group-hover:text-brand" />
                                Baixar Gabarito
                            </button>
                        </div>

                        {/* Ficha Técnica Card */}
                        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 space-y-6">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-brand rounded-full"></div>
                                Detalhes Técnicos
                            </h3>
                            <div className="space-y-3">
                                {(() => {
                                    const specs = product.technicalSpecs;
                                    if (!specs) {
                                        return <p className="text-[11px] text-gray-400 italic">Nenhuma especificação disponível para este produto.</p>;
                                    }
                                    
                                    const filteredEntries = Object.entries(specs).filter(([key, value]) => 
                                        !['printing', 'extras', 'option_illustrations', 'formatPrices', 'finishPrices', 'printingPrices', 'extraPrices'].includes(key) && 
                                        typeof value !== 'object' &&
                                        value !== null &&
                                        value !== undefined
                                    );

                                    if (filteredEntries.length === 0) {
                                        return <p className="text-[11px] text-gray-400 italic">Nenhuma especificação disponível para este produto.</p>;
                                    }

                                    return filteredEntries.map(([key, value]) => {
                                        const labels: Record<string, string> = {
                                            paper: "Papel / Material",
                                            weight: "Gramatura",
                                            mass: "Peso",
                                            ennoblement: "Enobrecimento",
                                            colors: "Cores",
                                            finalSize: "Tamanho Final",
                                            bleedSize: "Tam. com Sangria",
                                            productionTime: "Prazo de Produção"
                                        };
                                        return (
                                            <div key={key} className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-3 last:border-0">
                                                <span className="text-gray-500 font-medium">{labels[key] || key}</span>
                                                <span className="font-semibold text-gray-900 text-right">{String(value)}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mobile Bottom Bar (Refined) */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex items-center justify-between gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Total do Pedido</span>
                    <span className="text-xl font-semibold text-gray-900 tracking-tight">{formatPrice(finalPrice)}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-brand text-white font-semibold h-12 rounded text-center active:scale-95 transition-all shadow-lg shadow-brand/20"
                >
                    Comprar
                </button>
            </div>

            {/* Alerts */}
            {showUploadAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 mx-auto">
                            <UploadCloud size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Inclua sua Logo</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Para prosseguir com a compra, você precisa enviar o arquivo da sua logo para personalização.
                        </p>
                        <button
                            onClick={() => setShowUploadAlert(false)}
                            className="w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                        >
                            Entendi, vou enviar
                        </button>
                    </div>
                </div>
            )}

            {showArtworkAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 mx-auto">
                            <UploadCloud size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Envie sua Arte</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Você selecionou a opção de usar arte própria. Por favor, faça o upload do arquivo da sua arte para continuar.
                        </p>
                        <button
                            onClick={() => setShowArtworkAlert(false)}
                            className="w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                        >
                            Entendi, vou enviar
                        </button>
                    </div>
                </div>
            )}

            {showTextAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600 mx-auto">
                            <div className="font-serif text-2xl font-semibold">Aa</div>
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Personalização Necessária</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Este produto requer personalização. Por favor, preencha o campo <span className="font-semibold">"{product.customText?.label}"</span> antes de continuar.
                        </p>
                        <button
                            onClick={() => setShowTextAlert(false)}
                            className="w-full bg-brand text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            Preencher agora
                        </button>
                    </div>
                </div>
            )}

            {showTextSecondaryAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600 mx-auto">
                            <div className="font-serif text-2xl font-semibold">Aa</div>
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Personalização Necessária</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Este produto requer preenchimento do campo <span className="font-semibold">"{product.customText?.secondaryLabel}"</span> antes de continuar.
                        </p>
                        <button
                            onClick={() => setShowTextSecondaryAlert(false)}
                            className="w-full bg-brand text-white font-semibold py-3 rounded-xl transition-colors animate-all"
                        >
                            Preencher agora
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
