"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Check, UploadCloud, Truck } from "lucide-react";
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
    const [selectedFormat, setSelectedFormat] = useState("");
    const [selectedFinish, setSelectedFinish] = useState("");
    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({});
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariationImage, setSelectedVariationImage] = useState<string | null>(null);
    const [designOption, setDesignOption] = useState<"upload" | "hire">("upload");
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Alert Modal State
    const [showUploadAlert, setShowUploadAlert] = useState(false);
    const [showTextAlert, setShowTextAlert] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

    // Custom Dimensions State
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // in cm

    // Custom Text State
    const [customTextValue, setCustomTextValue] = useState("");

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
            if (product.formats && product.formats.length > 0) setSelectedFormat(product.formats[0]);
            if (product.finishes && product.finishes.length > 0) setSelectedFinish(product.finishes[0]);

            // Initialize dynamic variations
            if (product.variations) {
                const initialVariations: { [key: string]: string } = {};
                product.variations.forEach(v => {
                    if (v.options.length > 0) {
                        initialVariations[v.name] = v.options[0];
                    }
                });
                setSelectedVariations(initialVariations);
            }
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

    const finalPrice = calculatedBasePrice + finalVariationsPrice + designPrice;

    const productImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    const handleBuyNow = () => {
        if (!product) return;

        const isDesignEnabled = product.hasDesignOption !== false;

        if (isDesignEnabled && designOption === "upload" && !uploadedFile) {
            setShowUploadAlert(true);
            return;
        }

        if (product.customText?.enabled && product.customText.required && !customTextValue.trim()) {
            setShowTextAlert(true);
            return;
        }

        addToCart({
            productId: product.id,
            title: product.title,
            price: finalPrice,
            quantity: 1,
            image: selectedVariationImage || productImages[activeImage] || productImages[0] || "",
            details: {
                paper: product.technicalSpecs?.paper || "",
                finish: selectedFinish,
                format: selectedFormat,
                designOption: designOption,
                quantity: quantity,
                dimensions: product.allowCustomDimensions ? dimensions : undefined,
                selectedVariations: selectedVariations,
                fileUrl: uploadedFile?.url,
                fileName: uploadedFile?.name,
                customText: customTextValue
            }
        });

        router.push("/carrinho");
    };

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            {/* Custom Nav for Product */}
            <div className="sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4 md:hidden">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={22} className="text-gray-700" />
                </Link>
                <h1 className="text-sm font-bold truncate max-w-[200px]">{product.title}</h1>
                <div className="relative p-2">
                    <Link href="/carrinho">
                        <ShoppingCart size={22} className="text-gray-700" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full"></span>
                    </Link>
                </div>
            </div>

            <Container className="pt-0 md:pt-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: IMAGES */}
                    <div>
                        <div className="aspect-square bg-white rounded-2xl relative flex items-center justify-center overflow-hidden mb-4 border border-border">
                            {/* Main Image Display */}
                            {productImages.length > 0 || selectedVariationImage ? (
                                <Image
                                    src={selectedVariationImage || productImages[activeImage] || productImages[0]}
                                    alt={product.title}
                                    fill
                                    className="object-contain p-2 animate-in fade-in zoom-in-50 duration-300"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <span className="text-4xl mb-2">📷</span>
                                    <span className="text-sm">Sem imagem</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveImage(idx);
                                            setSelectedVariationImage(null);
                                        }}
                                        className={cn(
                                            "min-w-[70px] w-[70px] h-[70px] rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all overflow-hidden relative bg-gray-50",
                                            activeImage === idx
                                                ? "border-brand ring-1 ring-brand"
                                                : "border-transparent hover:border-gray-300"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="70px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: CONFIG */}
                    <div className="px-4 md:px-0 mt-6 md:mt-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

                        {/* 1. DESCRIPTION TOGGLE */}
                        <div className="mb-6">
                            <p className={`text-sm text-gray-600 leading-relaxed transition-all ${showFullDesc ? "" : "line-clamp-2"}`}>
                                {product.description}
                            </p>
                            {product.description && product.description.length > 100 && (
                                <button
                                    onClick={() => setShowFullDesc(!showFullDesc)}
                                    className="text-brand font-bold text-xs mt-1 hover:underline"
                                >
                                    {showFullDesc ? "Ler menos" : "Ler descrição completa"}
                                </button>
                            )}
                        </div>

                        {/* 2. CUSTOM DIMENSIONS (If enabled) */}
                        {product.allowCustomDimensions && (
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    Dimensões
                                    <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full normal-case">Medidas em cm</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Largura (cm)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand font-bold text-lg h-12 text-center"
                                            placeholder="0"
                                            value={dimensions.width || ""}
                                            onChange={(e) => setDimensions(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Altura (cm)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-xl border-gray-200 focus:border-brand focus:ring-brand font-bold text-lg h-12 text-center"
                                            placeholder="0"
                                            value={dimensions.height || ""}
                                            onChange={(e) => setDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                </div>
                                {(dimensions.width > 0 && dimensions.height > 0) && (
                                    <div className="mt-3 text-center">
                                        <p className="text-xs text-gray-500">
                                            Área total: <span className="font-bold text-gray-900">{((dimensions.width * dimensions.height) / 10000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} m²</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. QUANTITY SELECTOR */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Quantidade</h3>

                            {product.customQuantity ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Escolha a quantidade</label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setQuantity(Math.max((product.minQuantity || 1), quantity - 1))}
                                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val)) setQuantity(val);
                                                    }}
                                                    onBlur={() => {
                                                        let val = quantity;
                                                        if (product.minQuantity && val < product.minQuantity) val = product.minQuantity;
                                                        if (product.maxQuantity && val > product.maxQuantity) val = product.maxQuantity;
                                                        setQuantity(val);
                                                    }}
                                                    className="flex-1 sm:flex-none w-full sm:w-24 h-10 text-center font-bold text-lg border border-gray-200 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                                                />
                                                <button
                                                    onClick={() => setQuantity(Math.min((product.maxQuantity || 10000), quantity + 1))}
                                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Mínimo: {product.minQuantity || 1} | Máximo: {product.maxQuantity || 1000}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                                            <span className="text-xs text-gray-500 block">Valor Unitário Aproximado</span>
                                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.customQuantity ? price : price / 100)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                                        <span className="font-bold text-gray-700">Subtotal</span>
                                        <span className="font-bold text-xl text-brand">{formatPrice(calculatedBasePrice)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-2 bg-gray-50 p-2 text-xs font-bold text-gray-500 text-center border-b border-gray-200">
                                        <span>Qtd</span>
                                        <span>Total</span>
                                    </div>
                                    {(() => {
                                        let list: string[] = [];
                                        if (product.priceBreakdowns && Object.keys(product.priceBreakdowns).length > 0) {
                                            list = Object.keys(product.priceBreakdowns)
                                                .map(Number)
                                                .sort((a, b) => a - b)
                                                .map(q => `${q} un.`);
                                        } else if (product.quantities && product.quantities.length > 0) {
                                            list = product.quantities;
                                        } else {
                                            list = ["100 un.", "250 un.", "500 un.", "1000 un."];
                                        }
                                        return list;
                                    })().map((qtyStr, idx) => {
                                        const qtyNum = parseInt(qtyStr.match(/\d+/)?.[0] || "100");
                                        let optionPrice = 0;
                                        if (product.priceBreakdowns && product.priceBreakdowns[qtyNum]) {
                                            optionPrice = product.priceBreakdowns[qtyNum];
                                        } else {
                                            optionPrice = price * (qtyNum / 100);
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setQuantity(qtyNum)}
                                                className={`grid grid-cols-2 p-3 text-sm text-center cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${quantity === qtyNum ? "bg-orange-50/50" : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="font-bold text-gray-900 flex items-center justify-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${quantity === qtyNum ? "border-brand" : "border-gray-300"}`}>
                                                        {quantity === qtyNum && <div className="w-2 h-2 rounded-full bg-brand"></div>}
                                                    </div>
                                                    {qtyStr}
                                                </div>
                                                <div className={`font-bold ${quantity === qtyNum ? "text-brand" : "text-gray-900"}`}>
                                                    {formatPrice(optionPrice)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. FORMAT & FINISHING */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {product.formats && product.formats.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Formato</h3>
                                    <div className="flex flex-col gap-2">
                                        {product.formats.map((fmt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedFormat(fmt)}
                                                className={cn(
                                                    "px-4 py-3 rounded-lg text-sm font-medium border text-left transition-all",
                                                    selectedFormat === fmt
                                                        ? "border-brand bg-orange-50 text-brand font-bold ring-1 ring-brand"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50"
                                                )}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {product.finishes && product.finishes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Acabamento</h3>
                                    <div className="flex flex-col gap-2">
                                        {product.finishes.map((fin, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedFinish(fin)}
                                                className={cn(
                                                    "px-4 py-3 rounded-lg text-sm font-medium border text-left transition-all",
                                                    selectedFinish === fin
                                                        ? "border-brand bg-orange-50 text-brand font-bold ring-1 ring-brand"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50"
                                                )}
                                            >
                                                {fin}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. DYNAMIC VARIATIONS */}
                        {product.variations && product.variations.length > 0 && (
                            <div className="mb-8 space-y-6">
                                {product.variations.map((variation, vIdx) => (
                                    <div key={vIdx}>
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                                            {variation.name}
                                            {selectedVariations[variation.name] && (
                                                <span className="text-xs font-normal text-brand bg-brand/5 px-2 py-0.5 rounded-full">
                                                    {selectedVariations[variation.name]}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {variation.options.map((option, oIdx) => {
                                                const isSelected = selectedVariations[variation.name] === option;
                                                const varImage = variation.images?.[option];
                                                const priceAddon = variation.prices?.[option] || 0;

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
                                                            "relative group transition-all rounded-xl border flex items-center justify-center overflow-hidden",
                                                            varImage
                                                                ? "w-full h-auto aspect-square p-1 bg-white"
                                                                : "px-4 py-2 min-h-[40px]",
                                                            isSelected
                                                                ? "border-brand ring-1 ring-brand bg-brand/5 text-brand"
                                                                : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                                                        )}
                                                        title={option}
                                                    >
                                                        {varImage ? (
                                                            <>
                                                                <Image src={varImage} alt={option} fill className="object-contain" sizes="100px" />
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-brand/20 z-10 flex items-center justify-center">
                                                                        <div className="bg-white rounded-full p-0.5 shadow-sm">
                                                                            <Check size={12} className="text-brand" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center backdrop-blur-sm">
                                                                    {option}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-sm font-medium">{option}</span>
                                                                {priceAddon > 0 && <span className="text-[10px] text-green-600 font-bold">+{formatPrice(priceAddon)}</span>}
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 5. CUSTOM TEXT INPUT (PERSONALIZATION) */}
                        {product.customText?.enabled && (
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="text-sm font-bold text-gray-900 mb-2 block flex items-center gap-2">
                                    {product.customText.label}
                                </label>
                                <textarea
                                    className={cn(
                                        "w-full rounded-xl border p-3 text-sm focus:ring-2 outline-none transition-all resize-y min-h-[80px]",
                                        "border-gray-200 focus:border-brand focus:ring-brand/10 bg-white"
                                    )}
                                    placeholder={product.customText.placeholder}
                                    value={customTextValue}
                                    onChange={(e) => {
                                        setCustomTextValue(e.target.value);
                                    }}
                                />
                            </div>
                        )}

                        {/* 6. DESIGN OPTIONS */}
                        {product.hasDesignOption !== false && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Arte Final</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Option 1: Upload */}
                                    <div
                                        className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${designOption === "upload"
                                            ? "border-brand bg-orange-50/10"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        onClick={() => setDesignOption("upload")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${designOption === "upload" ? "border-brand" : "border-gray-300"}`}>
                                                {designOption === "upload" && <div className="w-2.5 h-2.5 bg-brand rounded-full"></div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-bold ${designOption === "upload" ? "text-gray-900" : "text-gray-600"}`}>Já tenho minha arte</span>
                                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Grátis</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-3">Envie seu arquivo pronto (PDF, Imagem, CorelDraw).</p>

                                                {/* File Upload Logic */}
                                                {designOption === "upload" && (
                                                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                                        {!uploadedFile ? (
                                                            <div className="flex gap-2 items-center">
                                                                <input
                                                                    type="file"
                                                                    id="file-upload"
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

                                                                            setUploadedFile({
                                                                                name: file.name,
                                                                                url: publicUrlData.publicUrl
                                                                            });

                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert("Erro ao enviar arquivo. Tente novamente.");
                                                                        } finally {
                                                                            setIsUploading(false);
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor="file-upload"
                                                                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer bg-white border border-dashed rounded-lg py-3 transition-colors text-sm font-medium ${isUploading ? 'border-brand/50 bg-brand/5 text-brand cursor-wait' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                                                                >
                                                                    {isUploading ? (
                                                                        <>
                                                                            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                                                                            Enviando...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <UploadCloud size={18} className="text-brand" />
                                                                            Escolher Arquivo (PDF, Imagem, Corel)
                                                                        </>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className="bg-green-100 p-1.5 rounded-full text-green-600 flex-shrink-0">
                                                                        <Check size={14} />
                                                                    </div>
                                                                    <span className="text-sm text-green-800 font-medium break-all line-clamp-2 flex-1 min-w-0">{uploadedFile.name}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setUploadedFile(null);
                                                                    }}
                                                                    className="text-xs text-brand hover:text-orange-700 font-bold px-2 py-1"
                                                                >
                                                                    Remover
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 2: Hire Designer */}
                                    <div
                                        className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${designOption === "hire"
                                            ? "border-brand bg-orange-50/10"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        onClick={() => setDesignOption("hire")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${designOption === "hire" ? "border-brand" : "border-gray-300"}`}>
                                                {designOption === "hire" && <div className="w-2.5 h-2.5 bg-brand rounded-full"></div>}
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-1 w-full gap-2">
                                                    <span className={`font-bold ${designOption === "hire" ? "text-gray-900" : "text-gray-600"}`}>Contratar Criação</span>
                                                    <span className="text-xs font-bold text-brand">+ R$ 35,00</span>
                                                </div>
                                                <p className="text-xs text-gray-500">Nossa equipe cria a arte profissional para você.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                        {/* 5. FREIGHT CALCULATOR */}
                        <div className="border border-gray-200 rounded-xl p-4 mb-8 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Truck size={16} className="text-brand" />
                                Frete e Prazo
                            </h3>
                            <div className="flex items-center gap-3 bg-white border border-green-200 p-3 rounded-lg">
                                <div className="bg-green-100 p-2 rounded-full text-green-700">
                                    <Check size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Retirada na Loja</p>
                                    <p className="text-xs text-gray-500">Disponível em até 5 dias úteis</p>
                                </div>
                                <span className="text-sm font-bold text-green-600">Grátis</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO SECTIONS */}
                <div className="mt-12 md:mt-16 grid grid-cols-1 gap-6 max-w-4xl mx-auto pb-8">
                    {/* Descrição Detalhada */}
                    {product.fullDescription && (
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-1 h-6 bg-brand rounded-full"></div>
                                Descrição do Produto
                            </h2>
                            <div className="prose prose-sm max-w-none text-gray-600 text-justify whitespace-pre-line">
                                {product.fullDescription}
                            </div>
                        </section>
                    )}

                    {/* Ficha Técnica */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-brand rounded-full"></div>
                            Ficha Técnica
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
                            {product.technicalSpecs ? Object.entries(product.technicalSpecs).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                    paper: "Papel",
                                    weight: "Gramatura",
                                    physicalWeight: "Peso",
                                    ennoblement: "Enobrecimento",
                                    colors: "Cores",
                                    finalSize: "Tamanho Final",
                                    bleedSize: "Tamanho com Sangria",
                                    productionTime: "Produção"
                                };
                                return (
                                    <div key={key} className="flex justify-between border-b border-gray-100 py-3">
                                        <span className="text-gray-500 font-medium capitalize">{labels[key] || key}</span>
                                        <span className="font-bold text-gray-900">{value}</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-gray-500 italic">Informações técnicas indisponíveis.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sticky Action Footer (Mobile) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-50 flex items-center justify-between shadow-2xl">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Total Estimado</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-brand">{formatPrice(finalPrice)}</span>
                            <span className="text-xs text-gray-400 font-normal">/ {quantity} un.</span>
                        </div>
                    </div>
                    <button
                        onClick={handleBuyNow}
                        className="bg-brand text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 active:scale-95 transition-all"
                    >
                        Comprar
                    </button>
                </div>

                {/* Desktop Sidebar Action (Optional or just keep inline?) */}
                {/* For this layout, we probably want a sticky summary on desktop too, but currently it's inline in Previous V0. 
                    Let's Add a Floating Desktop Bar or leave it as standard flow.
                    Standard flow is fine for now to match exactly previous "page.tsx".
                 */}
                <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-4 items-center gap-8 z-40 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total do Pedido</span>
                        <span className="text-2xl font-bold text-brand">{formatPrice(finalPrice)}</span>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Resumo</span>
                        <span className="text-sm font-medium text-gray-700">{quantity} {selectedFormat}</span>
                    </div>
                    <button
                        onClick={handleBuyNow}
                        className="bg-brand hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Adicionar ao Carrinho
                    </button>
                </div>

            </Container>

            {/* Alerts */}
            {showUploadAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 mx-auto">
                            <UploadCloud size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Arquivo Necessário</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Você selecionou a opção <strong>"Já tenho minha arte"</strong>, mas não enviou nenhum arquivo. Por favor, faça o upload antes de continuar.
                        </p>
                        <button
                            onClick={() => setShowUploadAlert(false)}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                        >
                            Entendi, vou enviar
                        </button>
                    </div>
                </div>
            )}

            {showTextAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600 mx-auto">
                            <div className="font-serif text-2xl font-bold">Aa</div>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Personalização Necessária</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Este produto requer personalização. Por favor, preencha o campo <strong>"{product.customText?.label}"</strong> antes de continuar.
                        </p>
                        <button
                            onClick={() => setShowTextAlert(false)}
                            className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            Preencher agora
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
