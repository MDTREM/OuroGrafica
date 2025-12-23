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
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) setProducts(productsData);

        // Categories
        const { data: categoriesData } = await supabase.from('categories').select('*');
        if (categoriesData) setCategories(categoriesData);

        // Orders
        // Orders with Items
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .order('created_at', { ascending: false });

        if (ordersData) {
            const mappedOrders: Order[] = ordersData.map((o: any) => ({
                ...o,
                items: o.items || [], // Ensure items array
                customerName: o.customer_info?.name || "Cliente Desconhecido",
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
        const { data, error } = await supabase.from('products').insert([product]).select().single();
        if (data && !error) {
            setProducts(prev => [data, ...prev]);
            return { success: true, data };
        }
        console.error("Error adding product:", error);
        return { success: false, error };
    };

    const updateProduct = async (updatedProduct: Product) => {
        const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
        if (!error) {
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            return { success: true };
        }
        console.error("Error updating product:", error);
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

        const newProduct = {
            ...rest,
            title: `${product.title} (Cópia)`,
            // slug not in type, relying on auto-gen or omitted
        };

        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (data && !error) {
            setProducts(prev => [data, ...prev]);
        } else {
            console.error("Error duplicating product:", error);
            alert("Erro ao duplicar produto. Veja o console.");
        }
    };

    const importProducts = async (newProducts: Product[]) => {
        // Bulk insert
        const { data, error } = await supabase.from('products').insert(newProducts).select();
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
