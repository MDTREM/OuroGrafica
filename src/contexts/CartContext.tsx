"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Coupon } from "@/data/mockData";

export interface CartItem {
    id: string; // Unique identifier for the cart item (mix of productId + options)
    productId: string;
    title: string;
    subtitle?: string;
    price: number;
    quantity: number;
    image: string;
    // Optional details to persist selections
    details?: {
        paper: string;
        finish: string;
        format?: string;
        designOption: string;
        quantity?: number;
        dimensions?: {
            width: number;
            height: number;
        };
        selectedVariations?: { [key: string]: string };
        fileUrl?: string;
        fileName?: string;
        customText?: string; // User input for custom text field
    };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;

    // Financials
    subtotal: number; // Raw sum of items (Product + Design)
    productTotal: number; // subtotal - designFees
    designFees: number;
    shipping: number;
    discount: number;
    total: number;

    // Coupon
    coupon: Coupon | null;
    applyCoupon: (coupon: Coupon) => void;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const shipping = 0.00; // Free (Pickup in Store)

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("@ourografica:cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from local storage");
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("@ourografica:cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, "id">) => {
        setItems((prev) => {
            const id = `${newItem.productId}-${Date.now()}`;
            return [...prev, { ...newItem, id }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setItems([]);
        setCoupon(null);
    };

    const applyCoupon = (newCoupon: Coupon) => {
        setCoupon(newCoupon);
    };

    const removeCoupon = () => {
        setCoupon(null);
    };

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Calculate Designer Fees (assuming R$ 35.00 per item with hire option)
    const designFees = items.reduce((acc, item) => {
        if (item.details?.designOption === 'hire') {
            return acc + (35.00 * item.quantity);
        }
        return acc;
    }, 0);

    const productTotal = subtotal - designFees;

    // Calculate Discount (Apply to Subtotal including Design Fees)
    let discount = 0;
    if (coupon) {
        if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
        } else {
            discount = coupon.value;
        }
        // Cap discount at subtotal
        if (discount > subtotal) discount = subtotal;
    }

    const total = Math.max(0, productTotal - discount + designFees + shipping);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart,
            subtotal, productTotal, designFees, shipping, discount, total,
            coupon, applyCoupon, removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
