"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/contexts/AdminContext";
import { CONSTANTS, Coupon } from "@/data/mockData";
import { useState } from "react";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, subtotal, total, coupon, applyCoupon, removeCoupon } = useCart();
    const { coupons } = useAdmin();

    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");

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

    function handleApplyCoupon() {
        setCouponError("");
        if (!couponCode) return;

        const found = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);

        if (!found) {
            setCouponError("Cupom inválido ou expirado.");
            applyCoupon(null as any); // Reset if invalid? Or just show error. Better just show error.
            return;
        }

        applyCoupon(found);
        setCouponCode(""); // Clear input on success
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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
                    <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nenhum produto.</p>
                    <Link href="/" className="inline-flex items-center justify-center w-full bg-brand text-white font-bold h-12 rounded-full hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
                        Começar a Comprar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white border-b border-gray-100 p-4 mb-6 sticky top-0 z-30 flex items-center justify-center">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={22} className="text-brand" />
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
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                                            <p className="text-xs text-gray-500">{item.subtitle}</p>

                                            {hasDesigner && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-brand font-bold bg-brand/5 px-2 py-0.5 rounded-md w-fit">
                                                    <Tag size={10} />
                                                    Criação de Arte Inclusa (+R$ 35,00 un.)
                                                </div>
                                            )}
                                            {item.details?.dimensions && (
                                                <div className="mt-1">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                        Dimensões: <b>{item.details.dimensions.width}x{item.details.dimensions.height} cm</b>
                                                    </span>
                                                </div>

                                            )}
                                            {item.details?.selectedVariations && Object.entries(item.details.selectedVariations).map(([key, value]) => (
                                                <div key={key} className="mt-1">
                                                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">
                                                        {key}: <b>{value}</b>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-brand">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                {/* Optional: Show base price breakdown if wanted */}
                                            </div>

                                            {/* Qty Control */}
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-100 px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="text-gray-400 hover:text-brand transition-colors disabled:opacity-50"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-medium text-gray-700 w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="text-gray-400 hover:text-brand transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
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

                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand font-bold hover:underline mt-4">
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
                                        className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        disabled={!couponCode}
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                {couponError && <p className="text-xs text-red-500 px-1">{couponError}</p>}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-green-700 font-medium">
                                    <Check size={16} />
                                    <span>Cupom <span className="font-bold">{coupon.code}</span> aplicado</span>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
                            <h2 className="font-bold text-gray-900 mb-4">Resumo do Pedido</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal (Produtos)</span>
                                    <span>R$ {productSubtotal.toFixed(2).replace('.', ',')}</span>
                                </div>

                                {totalDesignerFees > 0 && (
                                    <div className="flex justify-between text-sm text-brand mt-2 font-medium bg-brand/5 p-2 rounded">
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

                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                                    <span>Total</span>
                                    <span className="text-brand">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="w-full">
                                <button className="w-full bg-brand text-white font-bold py-3.5 rounded-full hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                                    Finalizar Compra
                                    <ArrowRight size={18} />
                                </button>
                            </Link>

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
