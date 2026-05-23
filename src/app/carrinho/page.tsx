"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, X, Info, Truck, Edit2, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CONSTANTS, Coupon } from "@/data/mockData";
import { useState } from "react";

// Order Details Modal Component
function OrderDetailsModal({ isOpen, onClose, items }: { isOpen: boolean, onClose: () => void, items: any[] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Detalhes do Pedido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {items.map((item, idx) => (
                        <div key={idx} className="space-y-4 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate text-sm">{item.title}</h3>
                                    <p className="text-xs text-brand font-semibold">{item.quantity} un. • R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Formato</p>
                                    <p className="text-xs font-semibold text-gray-700">{item.details?.format || "Padrão"}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Impressão</p>
                                    <p className="text-xs font-semibold text-gray-700">{item.details?.printing || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Acabamento</p>
                                    <p className="text-xs font-semibold text-gray-700">{item.details?.finish || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Extras</p>
                                    <p className="text-xs font-semibold text-gray-700">{item.details?.extra || "-"}</p>
                                </div>
                                {item.details?.selectedVariations && Object.entries(item.details.selectedVariations).filter(([k, v]) => v && v !== "-" && k !== "Papel" && k !== "Material").map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">{key}</p>
                                        <p className="text-xs font-semibold text-gray-700">{String(val)}</p>
                                    </div>
                                ))}
                                {item.details?.fileUrl && (
                                    <div className="col-span-2 space-y-1 pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Logo / Arquivo</p>
                                        <a href={item.details.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                                            Visualizar Logo ({item.details.fileName || "Download"})
                                        </a>
                                    </div>
                                )}
                                {item.details?.customArtworkUrl && (
                                    <div className="col-span-2 space-y-1 pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Arte Própria Enviada</p>
                                        <a href={item.details.customArtworkUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                                            Visualizar Arte ({item.details.customArtworkName || "Download"})
                                        </a>
                                    </div>
                                )}
                                {item.details?.customText && (
                                    <div className="col-span-2 space-y-1 pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">
                                            {item.details.customTextLabel || "Texto Personalizado"}
                                        </p>
                                        <p className="text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-line leading-relaxed">
                                            {item.details.customText}
                                        </p>
                                    </div>
                                )}
                                {item.details?.customTextSecondary && (
                                    <div className="col-span-2 space-y-1 pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">
                                            {item.details.customTextSecondaryLabel || "Informações de Contato"}
                                        </p>
                                        <p className="text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-line leading-relaxed">
                                            {item.details.customTextSecondary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                        Fechar Resumo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, subtotal, total, coupon, applyCoupon, removeCoupon, shipping, setShipping } = useCart();
    const { coupons } = useAdmin();

    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Expanded details on mobile
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Shipping Simulator States
    const [cep, setCep] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<any[] | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [shippingError, setShippingError] = useState("");

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) {
            value = `${value.slice(0, 5)}-${value.slice(5)}`;
        }
        setCep(value);
    };

    const calculateShipping = () => {
        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length !== 8) {
            setShippingError("Digite um CEP válido (8 dígitos).");
            return;
        }
        setShippingError("");
        setIsCalculating(true);
        setShippingOptions(null);

        setTimeout(() => {
            setIsCalculating(false);
            const options = [
                { id: "padrao", name: "Entrega Padrão (Jadlog)", price: 15.00, time: "3 a 5 dias úteis" },
                { id: "expresso", name: "Sedex Express", price: 32.90, time: "1 a 2 dias úteis" }
            ];
            setShippingOptions(options);
            setSelectedOptionId("padrao");
            setShipping(15.00);
        }, 1000);
    };
    const DESIGNER_FEE = 35.00;

    // Calculate details
    const totalDesignerFees = items.reduce((acc, item) => {
        if (item.details?.designOption === 'hire') {
            return acc + (DESIGNER_FEE * item.quantity);
        }
        return acc;
    }, 0);

    // Subtotal purely for products (removing the fees embedded in the price)
    const productSubtotal = subtotal - totalDesignerFees;

    // Calculate Discount for Display
    let discountAmount = 0;
    if (coupon) {
        if (coupon.type === 'percentage') {
            discountAmount = (productSubtotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }
        if (discountAmount > productSubtotal) discountAmount = productSubtotal;
    }

    const finalTotal = productSubtotal + totalDesignerFees + shipping - discountAmount;

    const { user } = useAuth();
    const [isApplying, setIsApplying] = useState(false);

    async function handleApplyCoupon() {
        setCouponError("");
        if (!couponCode) return;
        setIsApplying(true);

        try {
            const cleanCode = couponCode.toUpperCase().trim();
            const found = coupons.find(c => 
                c.code.toUpperCase().trim() === cleanCode && 
                (c.active === true || c.active === undefined)
            );

            if (!found) {
                setCouponError("Cupom inválido ou expirado.");
                return;
            }

            // Check Limit Per User
            if (found.limitPerUser) {
                if (!user) {
                    setCouponError("Este cupom é válido apenas para usuários logados.");
                    return;
                }

                // Check if user has already used this coupon
                const { data: existingOrders, error } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('coupon_code', found.code)
                    .limit(1);

                if (error) {
                    console.error("Error checking coupon usage:", error);
                }

                if (existingOrders && existingOrders.length > 0) {
                    setCouponError("Você já utilizou este cupom em uma compra anterior.");
                    return;
                }
            }

            applyCoupon(found);
            setCouponCode(""); // Clear input on success
        } catch (err) {
            setCouponError("Erro ao validar cupom. Tente novamente.");
        } finally {
            setIsApplying(false);
        }
    }

    function handleRemoveCoupon() {
        removeCoupon();
        setCouponCode("");
    }

    if (items.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen pb-24 flex flex-col items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
                    <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
                    <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nenhum produto.</p>
                    <Link href="/" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-brand to-brand-dark text-white font-semibold h-12 rounded-full hover:bg-gradient-to-r from-brand to-brand-dark/90 transition-all shadow-lg shadow-brand/20">
                        Começar a Comprar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white border-b border-gray-100 p-4 mb-6 sticky top-0 z-30 hidden md:flex items-center justify-center">
                <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={22} className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark" />
                    Seu Carrinho
                    <span className="text-sm text-gray-400 font-medium font-normal ml-1">({items.length} itens)</span>
                </h1>
            </div>

            <Container>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {items.map((item) => {
                            const hasDesigner = item.details?.designOption === 'hire';
                            const isExpanded = expandedItems.includes(item.id);

                            return (
                                <div key={item.id} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4 sm:gap-5">
                                    <div className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] bg-gray-50 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-100/50">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-gray-400 font-medium">IMG</div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        {/* Top Row: Title and Price */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{item.title}</h3>
                                                {item.details?.dimensions ? (
                                                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{item.quantity} un. • Ref: VK-{item.productId.slice(0, 5)}</p>
                                                ) : (
                                                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{item.quantity} un.</p>
                                                )}
                                            </div>
                                            <div className="mt-1 sm:mt-0 text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center">
                                                <span className="font-bold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </span>
                                                <button 
                                                    onClick={() => toggleExpanded(item.id)}
                                                    className="sm:hidden text-[11px] font-semibold text-brand flex items-center gap-1"
                                                >
                                                    {isExpanded ? 'Ocultar detalhes' : 'Exibir detalhes'}
                                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Middle Row: Details Box */}
                                        <div className={`mt-3 sm:mt-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100 ${isExpanded ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4`}>
                                            {item.subtitle && !item.details?.format && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Modelo</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.subtitle}</span>
                                                </div>
                                            )}
                                            {item.details?.format && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Formato</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.details.format}</span>
                                                </div>
                                            )}
                                            {item.details?.finish && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Acabamento</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.details.finish}</span>
                                                </div>
                                            )}
                                            {item.details?.paper && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Papel</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.details.paper}</span>
                                                </div>
                                            )}
                                            {item.details?.printing && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Impressão</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.details.printing}</span>
                                                </div>
                                            )}
                                            {item.details?.extra && (
                                                <div className="flex justify-between sm:block items-center">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block sm:mb-0.5">Extras</span>
                                                    <span className="text-[11px] sm:text-sm font-medium text-gray-800">{item.details.extra}</span>
                                                </div>
                                            )}
                                            {hasDesigner && (
                                                <div className="sm:col-span-2 mt-1">
                                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-brand font-semibold bg-brand/5 px-2 py-1 rounded-md w-fit border border-brand/10">
                                                        <Tag size={12} />
                                                        Criação de Arte Inclusa (+R$ 35,00 un.)
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Row: Actions */}
                                        <div className="flex items-center justify-end gap-5 mt-4">
                                            <Link href={`/produto/${item.productId}`} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-400 hover:text-brand transition-colors">
                                                <Edit2 size={13} />
                                                Editar
                                            </Link>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>

                    {/* Summary Column */}
                    <div className="lg:w-80 w-full space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-6">
                            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Resumo do Pedido</h2>
                            
                            {/* Coupon Code */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Tag size={14} className="text-gray-400 rotate-90" />
                                <span>Cupom de desconto</span>
                            </div>
                            
                            {!coupon ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cupom"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none text-gray-700 font-medium uppercase"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="bg-gray-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 min-w-[76px]"
                                            disabled={!couponCode || isApplying}
                                        >
                                            {isApplying ? "..." : "Aplicar"}
                                        </button>
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 px-1">{couponError}</p>}
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2 text-green-700 font-medium">
                                        <Check size={16} />
                                        <span>Cupom <span className="font-semibold">{coupon.code}</span> aplicado</span>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            </div>

                            <div className="border-t border-gray-100 w-full" />

                            {/* Simulação de Frete */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Truck size={14} className="text-brand animate-bounce" />
                                <span>Simular Frete</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="00000-000"
                                    value={cep}
                                    onChange={handleCepChange}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none text-gray-700 font-medium"
                                />
                                <button
                                    onClick={calculateShipping}
                                    disabled={isCalculating}
                                    className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[76px]"
                                >
                                    {isCalculating ? "..." : "Calcular"}
                                </button>
                            </div>
                            {shippingError && (
                                <p className="text-[11px] text-red-500">{shippingError}</p>
                            )}

                            {shippingOptions && (
                                <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto pr-1">
                                    {shippingOptions.map((opt) => (
                                        <label 
                                            key={opt.id}
                                            className={`flex items-center justify-between p-2.5 rounded-lg border text-[11px] cursor-pointer transition-all ${
                                                selectedOptionId === opt.id 
                                                    ? "border-brand bg-brand/5 font-semibold text-brand-dark" 
                                                    : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="radio" 
                                                    name="shipping_option"
                                                    checked={selectedOptionId === opt.id}
                                                    onChange={() => {
                                                        setSelectedOptionId(opt.id);
                                                        setShipping(opt.price);
                                                    }}
                                                    className="appearance-none h-4 w-4 border-2 border-gray-300 rounded-full checked:border-brand checked:border-[5px] transition-all bg-white cursor-pointer shadow-sm"
                                                />
                                                <div className="flex flex-col">
                                                    <span>{opt.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-normal">{opt.time}</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-brand">
                                                {opt.price === 0 ? "Grátis" : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            </div>

                            <div className="space-y-3 mb-6 border-t border-gray-100 pt-5">
                                <button 
                                    onClick={() => setIsDetailsModalOpen(true)}
                                    className="w-full flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-widest hover:text-brand transition-colors mb-4 group"
                                >
                                    <span>Ver detalhes dos itens</span>
                                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                                </button>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal (Produtos)</span>
                                    <span>R$ {productSubtotal.toFixed(2).replace('.', ',')}</span>
                                </div>

                                {totalDesignerFees > 0 && (
                                    <div className="flex justify-between text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark mt-2 font-medium bg-gradient-to-r from-brand to-brand-dark/5 p-2 rounded">
                                        <span>Criação de Arte</span>
                                        <span>R$ {totalDesignerFees.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Desconto</span>
                                        <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Frete</span>
                                    <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                                    <span>Total</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="w-full">
                                <button className="w-full bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                                    Finalizar Compra
                                    <ArrowRight size={18} />
                                </button>
                            </Link>

                            <Link href="/" className="w-full block">
                                <button className="w-full bg-white text-gray-700 border border-gray-200 font-semibold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 mt-3">
                                    <ArrowRight size={16} className="rotate-180 text-gray-400" />
                                    Continuar Comprando
                                </button>
                            </Link>

                            <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 flex items-start gap-2.5 mt-4">
                                <Info size={16} className="text-brand shrink-0 mt-0.5" />
                                <p className="text-[10px] font-semibold text-gray-700 leading-snug">
                                    O prazo de produção começa a contar somente após aprovação da arte e confirmação do pagamento.
                                </p>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 mt-4 leading-tight">
                                Ao finalizar, você será redirecionado para o checkout seguro.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>

            <OrderDetailsModal 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
                items={items} 
            />
        </div>
    );
}
