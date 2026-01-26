"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PRODUCTS, CATEGORIES, Product, Category, Coupon } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

// Define Types for Orders (extending the mock idea)
export interface OrderItem {
    id: string;
    title: string;
    quantity: number;
    price: number;
    details?: {
        format?: string;
        finish?: string;
        paper?: string;
        [key: string]: any;
    };
    designOption?: string; // 'upload', 'hire', 'none'
    uploadedFile?: string; // path or url
    image?: string;
}

export interface Order {
    id: string;
    display_id?: string;
    created_at: string;
    total: number;
    status: "Pendente" | "Produção" | "Enviado" | "Entregue";
    payment_method: string;
    customer_info: {
        name: string;
        email: string;
        phone: string;
        cpf?: string;
    };
    address_info: {
        zip: string;
        street: string;
        number: string;
        complement: string;
        district: string;
        city: string;
        state: string;
    };
    items: OrderItem[]; // Now an array of items, not number
    // Backwards compatibility for existing display
    customerName?: string; // derived
    date?: string; // derived
}

interface AdminContextType {
    products: Product[];
    categories: Category[];
    orders: Order[];
    addProduct: (product: Product) => Promise<{ success: boolean; error?: any; data?: Product }>;
    updateProduct: (product: Product) => Promise<{ success: boolean; error?: any }>;
    deleteProduct: (id: string) => void;
    duplicateProduct: (product: Product) => Promise<void>;
    importProducts: (products: Product[]) => void;

    // Categories
    addCategory: (category: Category) => Promise<{ success: boolean; error?: any; data?: Category }>;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;

    updateOrderStatus: (id: string, status: Order["status"]) => void;
    deleteOrder: (id: string) => Promise<{ success: boolean; error?: any }>;
    stats: {
        totalSales: number;
        pendingOrders: number;
        totalProducts: number;
        totalCustomers: number;
    };

    // Coupons
    coupons: Coupon[];
    addCoupon: (coupon: Coupon) => void;
    deleteCoupon: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Initial Data Load (Supabase)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Products
        // Products
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) {
            const mappedProducts = productsData.map((p: any) => ({
                ...p,
                customText: p.custom_text || p.customText, // Handle DB mapping
                pricePerM2: p.price_per_m2 || p.pricePerM2,
                hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : true // Default true
            }));
            setProducts(mappedProducts);
        }

        // Categories
        const { data: categoriesData } = await supabase.from('categories').select('*');
        if (categoriesData) setCategories(categoriesData);

        // Orders
        // Orders with Items
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersData) {
            const mappedOrders: Order[] = ordersData.map((o: any) => ({
                ...o,
                items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []), // Ensure items array handles JSON/Text
                customer_info: o.customer_info || {
                    name: o.customer_name || "Cliente sem nome",
                    email: o.customer_email || "Sem email",
                    phone: o.customer_phone || "Sem telefone", // We need to add phone/address columns to DB if they don't exist
                    cpf: o.customer_document || ""
                },
                // For now, if address is not in DB, use empty defaults or existing JSON if present
                address_info: o.address_info || {
                    zip: "", street: "", number: "", complement: "", district: "", city: "", state: ""
                },
                customerName: o.customer_name || o.customer_info?.name || "Cliente Desconhecido",
                date: new Date(o.created_at).toLocaleDateString('pt-BR'),
            }));
            setOrders(mappedOrders);
        }

        // Coupons
        const { data: couponsData } = await supabase.from('coupons').select('*');
        if (couponsData) setCoupons(couponsData);
    };

    // Persistence - Removed useEffects as we save directly on actions

    // Actions
    const addProduct = async (product: Product) => {
        const safePayload = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            // categoryId? usually just category string in this project structure
            active: product.active,
            image: product.image,
            images: product.images,

            // JSON/Array fields
            variations: product.variations,
            technicalSpecs: product.technicalSpecs,
            quantities: product.quantities,
            formats: product.formats,
            finishes: product.finishes,

            // Booleans / Config
            customQuantity: product.customQuantity,
            minQuantity: product.minQuantity,
            maxQuantity: product.maxQuantity,
            allowCustomDimensions: product.allowCustomDimensions,
            isNew: product.isNew,
            isFeatured: product.isFeatured,
            isBestSeller: product.isBestSeller,

            // Text
            fullDescription: product.fullDescription,
            subcategory: product.subcategory,
            unit: product.unit,
            color: product.color,
            custom_text: product.customText,
            price_per_m2: product.pricePerM2
        };

        const { data, error } = await supabase.from('products').insert([safePayload]).select().single();
        if (data && !error) {
            setProducts(prev => [data, ...prev]);
            return { success: true, data };
        }
        console.error("Error adding product:", error);
        return { success: false, error };
    };

    const updateProduct = async (updatedProduct: Product) => {
        // Sanitize payload to avoid "column not found" errors
        // whitelist fields that match DB columns
        const safePayload = {
            title: updatedProduct.title,
            description: updatedProduct.description,
            price: updatedProduct.price,
            category: updatedProduct.category,
            // categoryId? usually just category string in this project structure
            active: updatedProduct.active,
            image: updatedProduct.image,
            images: updatedProduct.images,

            // JSON/Array fields - assume DB handles them (Supabase usually does auto-conversion for JSONB)
            variations: updatedProduct.variations,
            technicalSpecs: updatedProduct.technicalSpecs,
            quantities: updatedProduct.quantities,
            formats: updatedProduct.formats,
            finishes: updatedProduct.finishes,

            // Booleans / Config
            customQuantity: updatedProduct.customQuantity,
            minQuantity: updatedProduct.minQuantity,
            maxQuantity: updatedProduct.maxQuantity,
            allowCustomDimensions: updatedProduct.allowCustomDimensions,
            isNew: updatedProduct.isNew,
            isFeatured: updatedProduct.isFeatured,
            isBestSeller: updatedProduct.isBestSeller,

            // Text
            fullDescription: updatedProduct.fullDescription,
            subcategory: updatedProduct.subcategory,
            unit: updatedProduct.unit,
            color: updatedProduct.color,
            price_per_m2: updatedProduct.pricePerM2,
            custom_text: updatedProduct.customText,
            has_design_option: updatedProduct.hasDesignOption
        };

        const { error } = await supabase.from('products').update(safePayload).eq('id', updatedProduct.id);

        if (!error) {
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            return { success: true };
        }
        console.error("Error updating product:", error);
        alert(`Erro ao atualizar produto: ${error.message}`);
        return { success: false, error };
    };

    const deleteProduct = async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    };

    const duplicateProduct = async (product: Product) => {
        // Create a copy without ID
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = product;

        const safePayload = {
            title: `${product.title} (Cópia)`,
            description: product.description,
            price: product.price,
            category: product.category,
            active: false, // duplications start inactive usually
            image: product.image,
            images: product.images,
            variations: product.variations,
            technicalSpecs: product.technicalSpecs,
            quantities: product.quantities,
            formats: product.formats,
            finishes: product.finishes,
            customQuantity: product.customQuantity,
            minQuantity: product.minQuantity,
            maxQuantity: product.maxQuantity,
            allowCustomDimensions: product.allowCustomDimensions,
            isNew: product.isNew,
            isFeatured: product.isFeatured,
            isBestSeller: product.isBestSeller,
            fullDescription: product.fullDescription,
            subcategory: product.subcategory,
            unit: product.unit,
            color: product.color,
            price_per_m2: product.pricePerM2,
            custom_text: product.customText,
            has_design_option: product.hasDesignOption
        };

        const { data, error } = await supabase.from('products').insert([safePayload]).select().single();
        if (data && !error) {
            setProducts(prev => [data, ...prev]);
        } else {
            console.error("Error duplicating product:", error);
            alert("Erro ao duplicar produto. Veja o console.");
        }
    };

    const importProducts = async (newProducts: Product[]) => {
        // Bulk insert with sanitization
        const safeProducts = newProducts.map(p => ({
            title: p.title,
            description: p.description,
            price: p.price,
            category: p.category,
            active: p.active,
            image: p.image,
            images: p.images,
            variations: p.variations,
            technicalSpecs: p.technicalSpecs,
            quantities: p.quantities,
            formats: p.formats,
            finishes: p.finishes,
            customQuantity: p.customQuantity,
            minQuantity: p.minQuantity,
            maxQuantity: p.maxQuantity,
            allowCustomDimensions: p.allowCustomDimensions,
            isNew: p.isNew,
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
            fullDescription: p.fullDescription,
            subcategory: p.subcategory,
            unit: p.unit,
            color: p.color,
            price_per_m2: p.pricePerM2,
            custom_text: p.customText,
            has_design_option: p.hasDesignOption
        }));

        const { data, error } = await supabase.from('products').insert(safeProducts).select();
        if (data && !error) setProducts(prev => [...data, ...prev]);
    };

    const addCategory = async (category: Category) => {
        const { data, error } = await supabase.from('categories').insert([category]).select().single();
        if (data && !error) {
            setCategories(prev => [...prev, data]);
            return { success: true, data };
        }
        console.error("Error adding category:", error);
        return { success: false, error };
    };

    const updateCategory = async (updatedCategory: Category) => {
        const { error } = await supabase.from('categories').update(updatedCategory).eq('id', updatedCategory.id);
        if (!error) setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) setCategories(prev => prev.filter(c => c.id !== id));
    };

    // Orders
    const updateOrderStatus = async (id: string, status: Order["status"]) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const deleteOrder = async (id: string) => {
        // 1. Delete items first (manual cascade)
        await supabase.from('order_items').delete().eq('order_id', id);

        // 2. Delete order
        const { error } = await supabase.from('orders').delete().eq('id', id);

        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== id));
            return { success: true };
        } else {
            console.error("Error deleting order:", error);
            return { success: false, error };
        }
    };

    // Coupons
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // remove useEffect for coupons load/save as it is handled by fetchData and addCoupon actions

    const addCoupon = async (coupon: Partial<Coupon>) => {
        const { data, error } = await supabase.from('coupons').insert([coupon]).select().single();
        if (data && !error) setCoupons(prev => [...prev, data]);
    };

    const deleteCoupon = async (id: string) => {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (!error) setCoupons(prev => prev.filter(c => c.id !== id));
    };

    // Derived Stats
    const stats = {
        totalSales: orders.reduce((acc, order) => acc + order.total, 0),
        pendingOrders: orders.filter(o => o.status === "Pendente").length,
        totalProducts: products.length,
        totalCustomers: new Set(orders.map(o => o.customerName)).size // Count unique customer names
    };

    return (
        <AdminContext.Provider value={{
            products,
            categories,
            orders,
            addProduct,
            updateProduct,
            deleteProduct,
            duplicateProduct,
            importProducts,
            addCategory,
            updateCategory,
            deleteCategory,
            updateOrderStatus,
            deleteOrder,
            stats,
            // Coupons
            coupons,
            addCoupon,
            deleteCoupon
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
