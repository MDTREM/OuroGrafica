"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Check, UploadCloud, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/mockData";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Product
    useEffect(() => {
        async function fetchProduct() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', resolvedParams.id)
                    .single();

                if (data) setProduct(data);
                if (error) console.error("Error fetching product:", error);
            } catch (err) {
                console.error("Failed to fetch product", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProduct();
    }, [resolvedParams.id]);

    const [quantity, setQuantity] = useState(100);
    const [paper, setPaper] = useState("couche300");
    const [finish, setFinish] = useState("fosca");
    const [activeImage, setActiveImage] = useState(0);
    const [designOption, setDesignOption] = useState<"upload" | "hire">("upload");
    const [showFullDesc, setShowFullDesc] = useState(false);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div></div>;
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>Produto não encontrado.</p>
                <Link href="/" className="text-brand hover:underline">Voltar para a loja</Link>
            </div>
        );
    }

    const price = product.price || 0;
    const designPrice = designOption === "hire" ? 35.00 : 0;

    // Simple logic for quantity multiplier
    const quantityMultiplier = quantity / 100;
    const calculatedBasePrice = price * (quantityMultiplier > 0 ? quantityMultiplier : 1);

    const finalPrice = calculatedBasePrice + designPrice;

    // Resolve images
    const productImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            title: product.title,
            subtitle: `${quantity} unid.`,
            price: finalPrice,
            quantity: 1,
            image: productImages[0] || "",
            details: {
                quantity,
                paper,
                finish,
                designOption
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
                        <div className="aspect-square bg-gray-100 rounded-2xl relative flex items-center justify-center overflow-hidden mb-4 border border-border">
                            {/* Main Image Display */}
                            {productImages.length > 0 ? (
                                <img
                                    src={productImages[activeImage] || productImages[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
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
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={cn(
                                            "min-w-[70px] h-[70px] rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all overflow-hidden",
                                            activeImage === idx
                                                ? "border-brand ring-1 ring-brand"
                                                : "border-transparent bg-gray-100 hover:border-gray-300"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
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

                        {/* 2. QUANTITY TABLE SELECTOR */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Quantidade</h3>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="grid grid-cols-2 bg-gray-50 p-2 text-xs font-bold text-gray-500 text-center border-b border-gray-200">
                                    <span>Qtd</span>
                                    <span>Total</span>
                                </div>
                                {(product.quantities && product.quantities.length > 0 ? product.quantities : ["100 un.", "250 un.", "500 un.", "1000 un."]).map((qtyStr, idx) => {
                                    // Extract number from string if possible, else use index logic
                                    const qtyNum = parseInt(qtyStr.match(/\d+/)?.[0] || "100");
                                    // Mock price calc
                                    const optionPrice = price * (qtyNum / 100);

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
                                                className="px-4 py-3 rounded-lg text-sm font-medium border text-left border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50"
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
                                            <div
                                                key={idx}
                                                className="px-4 py-3 rounded-lg text-sm font-medium border text-left border-gray-200 text-gray-600 bg-gray-50"
                                            >
                                                {fin}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. DESIGN OPTIONS */}
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
                                            <p className="text-xs text-gray-500 mb-3">Envie seu arquivo pronto para impressão (PDF, AI, CDR).</p>

                                            {/* Link Input (Visible only when selected) */}
                                            {designOption === "upload" && (
                                                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <UploadCloud size={16} className="absolute left-3 top-3 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Cole o link do seu arquivo (Drive, WeTransfer...)"
                                                                className="w-full text-sm border-2 border-dashed border-gray-300 rounded-lg h-10 pl-9 px-4 focus:outline-none focus:border-brand focus:bg-white bg-gray-50 transition-colors"
                                                            />
                                                        </div>
                                                    </div>
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

                        {/* 5. FREIGHT CALCULATOR */}
                        <div className="border border-gray-200 rounded-xl p-4 mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Truck size={16} className="text-brand" />
                                Calcular Frete e Prazo
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Digite seu CEP"
                                    className="flex-1 h-10 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand"
                                />
                                <Button size="sm" className="bg-brand text-white font-bold h-10 px-4">
                                    OK
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO SECTIONS */}
                <div className="mt-12 md:mt-16 grid grid-cols-1 gap-6 max-w-4xl mx-auto pb-8">
                    {/* Descrição Detalhada */}
                    {product.fullDescription && (
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Descrição do Produto</h2>
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
                            {product.technicalSpecs ? Object.entries(product.technicalSpecs).map(([key, value]) => (
                                <div key={key} className="flex justify-between border-b border-gray-100 py-3">
                                    <span className="text-gray-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="font-bold text-gray-900">{value}</span>
                                </div>
                            )) : (
                                <p className="text-gray-400 italic">Nenhuma especificação técnica informada.</p>
                            )}
                        </div>
                    </section>

                    {/* Como Enviar */}
                    <section className="bg-orange-50/50 p-6 md:p-8 rounded-2xl border border-orange-100 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Como enviar sua arte?</h2>
                                <p className="text-sm text-gray-600 leading-relaxed mb-6 md:mb-0">
                                    Para garantir a melhor qualidade de impressão, recomendamos utilizar nossos gabaritos oficiais. Eles já vêm com as margens de segurança e sangria configuradas.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand hover:bg-white shadow-sm font-bold">
                                    Baixar Gabarito
                                </Button>
                                <Button className="bg-brand hover:bg-brand/90 text-white shadow-md font-bold">
                                    Ver Guia de Fechamento
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

            </Container>

            {/* MOBILE STICKY ACTION */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 px-6 md:sticky md:bottom-0 md:bg-white md:border-t md:shadow-up z-50">
                <Container className="max-w-4xl p-0 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-xs text-gray-500 block">Total do Pedido</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-2xl text-brand">{formatPrice(finalPrice)}</span>
                            {designOption === "hire" && <span className="text-[10px] text-gray-400 font-medium">(+ Designer)</span>}
                        </div>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        className="flex-1 max-w-xs shadow-lg shadow-brand/20 text-base font-bold bg-brand text-white hover:bg-brand/90 py-6 rounded-full"
                    >
                        Comprar Agora
                    </Button>
                </Container>
            </div>
        </div>
    );
}
