"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PRODUCTS, CATEGORIES, Product, Category, Coupon } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

// Define Types for Orders (extending the mock idea)
export interface Order {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: "Pendente" | "Produção" | "Enviado" | "Entregue";
    items: number; // Count of items
}

interface AdminContextType {
    products: Product[];
    categories: Category[];
    orders: Order[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    importProducts: (products: Product[]) => void;

    // Categories
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;

    updateOrderStatus: (id: string, status: Order["status"]) => void;
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
        const { data: ordersData } = await supabase.from('orders').select('*');
        if (ordersData) setOrders(ordersData);

        // Coupons
        const { data: couponsData } = await supabase.from('coupons').select('*');
        if (couponsData) setCoupons(couponsData);
    };

    // Persistence - Removed useEffects as we save directly on actions

    // Actions
    const addProduct = async (product: Product) => {
        const { data, error } = await supabase.from('products').insert([product]).select().single();
        if (data && !error) setProducts(prev => [data, ...prev]);
    };

    const updateProduct = async (updatedProduct: Product) => {
        const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
        if (!error) setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    };

    const importProducts = async (newProducts: Product[]) => {
        // Bulk insert
        const { data, error } = await supabase.from('products').insert(newProducts).select();
        if (data && !error) setProducts(prev => [...data, ...prev]);
    };

    const addCategory = async (category: Category) => {
        const { data, error } = await supabase.from('categories').insert([category]).select().single();
        if (data && !error) setCategories(prev => [...prev, data]);
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

    // Coupons
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // remove useEffect for coupons load/save as it is handled by fetchData and addCoupon actions

    const addCoupon = async (coupon: Coupon) => {
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
            importProducts,
            addCategory,
            updateCategory,
            deleteCategory,
            updateOrderStatus,
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
