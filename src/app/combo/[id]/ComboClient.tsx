"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, UploadCloud, Truck, Download } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ComboItem } from "@/actions/homepage-actions";
import { useCart } from "@/contexts/CartContext";

interface ComboClientProps {
    combo: ComboItem;
}

export default function ComboClient({ combo }: ComboClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({});
    const [designOption, setDesignOption] = useState<"upload" | "hire">("upload");
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Alert Modals
    const [showUploadAlert, setShowUploadAlert] = useState(false);
    const [showTextAlert, setShowTextAlert] = useState(false);

    // Upload States
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

    // Custom Text State (Optional comments for personalization)
    const [customTextValue, setCustomTextValue] = useState("");

    // Initialize variation defaults
    useEffect(() => {
        if (combo && combo.variations) {
            const defaults: { [key: string]: string } = {};
            combo.variations.forEach(v => {
                if (v.options.length > 0) {
                    defaults[v.name] = v.options[0];
                }
            });
            setSelectedVariations(defaults);
        }
    }, [combo]);

    const designPrice = designOption === "hire" ? 35.00 : 0;
    const finalPrice = combo.price + designPrice;
    const originalPrice = combo.originalPrice || combo.price * 1.35;

    const handleAddToCart = () => {
        if (!combo) return;

        // Custom file upload validation
        if (designOption === "upload" && !uploadedFile) {
            setShowUploadAlert(true);
            return;
        }

        const variationsString = Object.entries(selectedVariations)
            .map(([name, val]) => `${name}: ${val}`)
            .join(", ");

        addToCart({
            productId: combo.id,
            title: combo.title,
            subtitle: "Combo Promocional",
            price: finalPrice,
            quantity: 1,
            image: combo.image || "",
            details: {
                paper: selectedVariations["Papel"] || selectedVariations["Material"] || "Padrão Combo",
                finish: selectedVariations["Acabamento"] || "Padrão Combo",
                format: selectedVariations["Formato"] || "Padrão Combo",
                designOption: designOption,
                selectedVariations: selectedVariations,
                fileUrl: uploadedFile?.url,
                fileName: uploadedFile?.name,
                customText: customTextValue || undefined,
                customTextLabel: "Instruções do Combo"
            }
        });

        router.push("/carrinho");
    };

    const handleWhatsAppClick = () => {
        const phone = "5531989880161";
        const itemsList = combo.items.map(item => `• ${item}`).join("\n");
        const varsList = Object.entries(selectedVariations)
            .map(([name, val]) => `*${name}:* ${val}`)
            .join("\n");
        
        const text = encodeURIComponent(
            `Olá! Gostaria de encomendar o *${combo.title}*\n\n` +
            (varsList ? `*Opções Selecionadas:*\n${varsList}\n\n` : "") +
            (customTextValue ? `*Observações:* ${customTextValue}\n\n` : "") +
            `*Valor:* ${formatPrice(finalPrice)}\n` +
            `*Itens inclusos:*\n${itemsList}\n\n` +
            `Como podemos dar andamento ao pedido e à criação das artes?`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="bg-background min-h-screen pb-32 relative">
            <Container className="pt-4 md:pt-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* COLUNA ESQUERDA: IMAGEM E DETALHES (Lg: 8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. IMAGEM DO COMBO */}
                        <div className="space-y-4">
                            <div className="aspect-square md:aspect-[16/10] rounded-xl relative flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                {combo.image ? (
                                    <Image
                                        src={combo.image}
                                        alt={combo.title}
                                        fill
                                        className="object-cover animate-in fade-in zoom-in-95 duration-500"
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        priority
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <span className="text-6xl mb-2">📦</span>
                                        <span className="text-sm font-medium">Sem imagem disponível</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. TÍTULO E DESCRIÇÃO (MOBILE ONLY) */}
                        <div className="lg:hidden space-y-6 px-1">
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Combo Promocional
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">{combo.title}</h1>
                            {combo.subtitle && (
                                <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed text-[13px]">
                                    <p>{combo.subtitle}</p>
                                </div>
                            )}
                        </div>

                        {/* 3. ITENS INCLUSOS */}
                        <section className="space-y-6 pt-6 border-t border-gray-100/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Itens Inclusos no Combo</h3>
                                <p className="text-xs text-gray-500">Confira todos os materiais que fazem parte deste pacote especial</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {combo.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <div className="w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0">
                                            <Check size={16} strokeWidth={3} className="text-brand" />
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. SELETORES DE VARIAÇÕES DO COMBO */}
                        {combo.variations && combo.variations.length > 0 && (
                            <div className="space-y-10 pt-10 border-t border-gray-100/60">
                                {combo.variations.map((variation, vIdx) => (
                                    <section key={vIdx} className="space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{variation.name}</h3>
                                            <p className="text-xs text-gray-500">Selecione uma opção de personalização geral</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            {variation.options.map((option, oIdx) => {
                                                const isSelected = selectedVariations[variation.name] === option;
                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.name]: option }))}
                                                        className={cn(
                                                            "group flex flex-col rounded-xl border-2 transition-all p-5 text-left bg-white shadow-sm duration-300 min-h-[90px] justify-between",
                                                            isSelected ? "border-brand bg-brand/5 ring-4 ring-brand/10 shadow-md" : "border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        <p className={cn("text-[13px] font-semibold leading-snug", isSelected ? "text-brand" : "text-gray-700")}>
                                                            {option}
                                                        </p>
                                                        <div className="flex items-center justify-end w-full mt-2">
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                                                isSelected ? "border-brand bg-brand" : "border-gray-200"
                                                            )}>
                                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA: RESUMO E COMPRA (Lg: 4 cols) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        
                        {/* TÍTULO E SUBTÍTULO (DESKTOP ONLY) */}
                        <div className="hidden lg:block space-y-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-brand/10 text-brand text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Combo Promocional
                                </span>
                            </div>
                            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{combo.title}</h1>
                            {combo.subtitle && (
                                <p className="text-sm text-gray-500 leading-relaxed">{combo.subtitle}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-8">
                            
                            {/* DESIGN CREATOR SERVICES */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Arte dos Materiais</h3>
                                    <p className="text-[11px] text-gray-400">Como deseja enviar as artes para os itens do combo?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDesignOption("upload")}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 bg-white",
                                            designOption === "upload" ? "border-brand bg-brand/5 shadow-xs" : "border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        <span className="text-lg">📁</span>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", designOption === "upload" ? "text-brand" : "text-gray-500")}>Já tenho arte</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDesignOption("hire")}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5 bg-white",
                                            designOption === "hire" ? "border-brand bg-brand/5 shadow-xs" : "border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        <span className="text-lg">✨</span>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", designOption === "hire" ? "text-brand" : "text-gray-500")}>Criar para mim</span>
                                    </button>
                                </div>
                            </div>

                            {/* UPLOAD BOX */}
                            <div className="space-y-6 pt-2">
                                <div className="space-y-3">
                                    {designOption === "upload" && (
                                        !uploadedFile ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    id="combo-upload"
                                                    className="hidden"
                                                    accept=".pdf,.cdr,.ai,.psd,.jpg,.png,.jpeg"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUploading(true);
                                                        try {
                                                            const fileName = `${Date.now()}_combo_${file.name.replace(/\s+/g, '_')}`;
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
                                                    htmlFor="combo-upload"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center py-4 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-1.5",
                                                        isUploading 
                                                            ? "border-brand bg-brand/5 animate-pulse" 
                                                            : "border-gray-100 bg-white hover:bg-gray-50 hover:border-brand/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                                        isUploading ? "bg-brand text-white" : "bg-white text-brand"
                                                    )}>
                                                        <UploadCloud size={16} />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {isUploading ? "Enviando..." : "Envie o arquivo das artes"}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400">
                                                            Carregue as logos ou modelos (Máx. 25MB)
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
                                                        <p className="text-[9px] text-green-600">Artes carregadas com sucesso!</p>
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

                                    {designOption === "hire" && (
                                        <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 text-left animate-in fade-in duration-300">
                                            <div className="flex gap-3">
                                                <span className="text-lg">🎨</span>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900 uppercase">Criação Profissional Inclusa</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Desenvolvemos o layout profissional de todos os itens do combo para você. Um designer entrará em contato logo após o pagamento.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Instuções Adicionais */}
                                    <div className="space-y-2 pt-3 border-t border-gray-100/50">
                                        <label htmlFor="combo-text-input" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Observações / Instruções
                                        </label>
                                        <textarea
                                            id="combo-text-input"
                                            rows={3}
                                            className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand shadow-xs placeholder:text-gray-400 p-3 bg-white"
                                            placeholder="Descreva detalhes como cores preferidas, redes sociais, telefones, ou como gostaria das artes."
                                            value={customTextValue}
                                            onChange={(e) => setCustomTextValue(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* RESUMO DO PEDIDO E COMPRA */}
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Resumo do Pedido
                                    </h2>
                                    
                                    <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-100/80">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Pacote</span>
                                            <span className="font-semibold text-gray-900">1x Combo Especial</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-medium">Preço Base do Combo</span>
                                            <span className="text-gray-400 font-medium">{formatPrice(combo.price)}</span>
                                        </div>
                                        {designPrice > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-medium">Serviço de Designer</span>
                                                <span className="text-green-600 font-semibold">+{formatPrice(designPrice)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-gray-200/60 flex justify-between items-end">
                                            <span className="text-gray-500 font-medium mb-0.5 text-xs">Total à vista</span>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 leading-none">{formatPrice(finalPrice)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                                        >
                                            Comprar Combo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleWhatsAppClick}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-500/10 text-xs"
                                        >
                                            Pedir pelo WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* ERROR ALERTS */}
            {showUploadAlert && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 text-xl font-bold">⚠️</div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Arquivo Necessário</h4>
                            <p className="text-sm text-gray-400 mt-1">Por favor, faça upload das suas artes ou clique em "Criar para mim" para que o designer crie as artes do combo para você!</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUploadAlert(false)}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
