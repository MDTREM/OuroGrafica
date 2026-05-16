"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, X, Info } from "lucide-react";
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                {item.details?.customText && (
                                    <div className="col-span-2 space-y-1 pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Texto Personalizado</p>
                                        <p className="text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">{item.details.customText}</p>
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
    const { items, removeFromCart, updateQuantity, subtotal, total, coupon, applyCoupon, removeCoupon } = useCart();
    const { coupons } = useAdmin();

    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const shipping = CONSTANTS.SHIPPING;
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
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
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
                            // Unit Price Display (Visual only, to show breakdown)
                            const unitPriceBase = item.price - (hasDesigner ? DESIGNER_FEE : 0);

                            return (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium bg-gray-200 rounded-lg">IMG</div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                                            <p className="text-xs text-gray-500">{item.subtitle}</p>

                                            {hasDesigner && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-medium bg-gradient-to-r from-brand to-brand-dark/5 px-2 py-0.5 rounded-md w-fit">
                                                    <Tag size={10} />
                                                    Criação de Arte Inclusa (+R$ 35,00 un.)
                                                </div>
                                            )}
                                            {item.details?.dimensions && (
                                                <div className="mt-1">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                        Dimensões: {item.details.dimensions.width}x{item.details.dimensions.height} cm
                                                    </span>
                                                </div>

                                            )}
                                            {item.details?.selectedVariations && Object.entries(item.details.selectedVariations).map(([key, value]) => (
                                                <div key={key} className="mt-1">
                                                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">
                                                        {key}: {String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                {/* Optional: Show base price breakdown if wanted */}
                                            </div>


                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}

                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-semibold hover:underline mt-4">
                            <ArrowRight size={16} className="rotate-180" />
                            Continuar Comprando
                        </Link>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:w-80 w-full space-y-4">
                        {/* Coupon Code */}
                        {!coupon ? (
                            <div className="space-y-2">
                                <div className="bg-white rounded-xl border border-gray-100 p-2 pl-4 flex items-center gap-2 shadow-sm">
                                    <Tag size={18} className="text-gray-400 rotate-90" />
                                    <input
                                        type="text"
                                        placeholder="Cupom de desconto"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none uppercase"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-w-[100px]"
                                        disabled={!couponCode || isApplying}
                                    >
                                        {isApplying ? "Validando..." : "Aplicar"}
                                    </button>
                                </div>
                                {couponError && <p className="text-xs text-red-500 px-1">{couponError}</p>}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-green-700 font-medium">
                                    <Check size={16} />
                                    <span>Cupom <span className="font-semibold">{coupon.code}</span> aplicado</span>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
                            <h2 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>

                            <div className="space-y-3 mb-6">
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
                                <button className="w-full bg-gradient-to-r from-brand to-brand-dark text-white font-semibold py-3.5 rounded hover:opacity-90 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                                    Finalizar Compra
                                    <ArrowRight size={18} />
                                </button>
                            </Link>

                            <OrderDetailsModal 
                                isOpen={isDetailsModalOpen} 
                                onClose={() => setIsDetailsModalOpen(false)} 
                                items={items} 
                            />

                            <p className="text-[10px] text-center text-gray-400 mt-4 leading-tight">
                                Ao finalizar, você será redirecionado para o checkout seguro.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
