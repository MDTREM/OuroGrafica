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
    addCoupon: (coupon: any) => Promise<{ success: boolean; error?: any; data?: Coupon }>;
    deleteCoupon: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

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
                technicalSpecs: p.technical_specs || p.technicalSpecs,
                customQuantity: p.custom_quantity !== undefined ? p.custom_quantity : p.customQuantity,
                minQuantity: p.min_quantity !== undefined ? p.min_quantity : p.minQuantity,
                maxQuantity: p.max_quantity !== undefined ? p.max_quantity : p.maxQuantity,
                allowCustomDimensions: p.allow_custom_dimensions !== undefined ? p.allow_custom_dimensions : p.allowCustomDimensions,
                isNew: p.is_new !== undefined ? p.is_new : p.isNew,
                isFeatured: p.is_featured !== undefined ? p.is_featured : p.isFeatured,
                isBestSeller: p.is_best_seller !== undefined ? p.is_best_seller : p.isBestSeller,
                fullDescription: p.full_description || p.fullDescription,
                customText: p.custom_text || p.customText,
                pricePerM2: p.price_per_m2 || p.pricePerM2,
                hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : (p.hasDesignOption !== undefined ? p.hasDesignOption : true),
                priceBreakdowns: p.price_breakdowns || p.priceBreakdowns || {},
                printing: p.technical_specs?.printing || p.printing || [],
                extras: p.technical_specs?.extras || p.extras || [],
                optionIllustrations: p.technical_specs?.option_illustrations || p.option_illustrations || p.optionIllustrations || {}
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
        if (couponsData) {
            const mappedCoupons = couponsData.map((c: any) => ({
                ...c,
                usageCount: c.usage_count !== undefined ? c.usage_count : c.usageCount,
                limitPerUser: c.limit_per_user !== undefined ? c.limit_per_user : c.limitPerUser,
            }));
            setCoupons(mappedCoupons);
        }
    };

    // Persistence - Removed useEffects as we save directly on actions

    // Actions
    const mapProductFromDB = (p: any): Product => ({
        ...p,
        technicalSpecs: p.technical_specs || p.technicalSpecs,
        customQuantity: p.custom_quantity !== undefined ? p.custom_quantity : p.customQuantity,
        minQuantity: p.min_quantity !== undefined ? p.min_quantity : p.minQuantity,
        maxQuantity: p.max_quantity !== undefined ? p.max_quantity : p.maxQuantity,
        allowCustomDimensions: p.allow_custom_dimensions !== undefined ? p.allow_custom_dimensions : p.allowCustomDimensions,
        isNew: p.is_new !== undefined ? p.is_new : p.isNew,
        isFeatured: p.is_featured !== undefined ? p.is_featured : p.isFeatured,
        isBestSeller: p.is_best_seller !== undefined ? p.is_best_seller : p.isBestSeller,
        fullDescription: p.full_description || p.fullDescription,
        customText: p.custom_text || p.customText,
        pricePerM2: p.price_per_m2 || p.pricePerM2,
        hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : (p.hasDesignOption !== undefined ? p.hasDesignOption : true),
        priceBreakdowns: p.price_breakdowns || p.priceBreakdowns || {},
        printing: p.printing || [],
        extras: p.extras || [],
        optionIllustrations: p.option_illustrations || p.optionIllustrations || {}
    });

    const addProduct = async (product: Product) => {
        const safePayload = {
            id: product.id || crypto.randomUUID(),
            title: product.title,
            description: product.description,
            price: Number(product.price) || 0,
            category: product.category,
            active: product.active,
            image: product.image,
            images: product.images,
            variations: product.variations,
            technical_specs: product.technicalSpecs,
            quantities: product.quantities,
            formats: product.formats,
            finishes: product.finishes,
            printing: product.printing,
            extras: product.extras,
            option_illustrations: product.optionIllustrations,
            custom_quantity: product.customQuantity,
            min_quantity: product.minQuantity,
            max_quantity: product.maxQuantity,
            allow_custom_dimensions: product.allowCustomDimensions,
            is_new: product.isNew,
            is_featured: product.isFeatured,
            is_best_seller: product.isBestSeller,
            full_description: product.fullDescription,
            subcategory: product.subcategory,
            unit: product.unit,
            color: product.color,
            price_per_m2: product.pricePerM2,
            custom_text: product.customText,
            has_design_option: product.hasDesignOption,
            price_breakdowns: product.priceBreakdowns
        };

        const { data, error } = await supabase.from('products').insert([safePayload]).select().single();
        if (data && !error) {
            setProducts(prev => [mapProductFromDB(data), ...prev]);
            return { success: true, data: mapProductFromDB(data) };
        }
        console.error("Error adding product:", error);
        return { success: false, error };
    };

    const updateProduct = async (updatedProduct: Product) => {
        const safePayload = {
            title: updatedProduct.title,
            description: updatedProduct.description,
            price: Number(updatedProduct.price) || 0,
            category: updatedProduct.category,
            active: updatedProduct.active,
            image: updatedProduct.image,
            images: updatedProduct.images,
            variations: updatedProduct.variations,
            technical_specs: updatedProduct.technicalSpecs,
            quantities: updatedProduct.quantities,
            formats: updatedProduct.formats,
            finishes: updatedProduct.finishes,
            printing: updatedProduct.printing,
            extras: updatedProduct.extras,
            option_illustrations: updatedProduct.optionIllustrations,
            custom_quantity: updatedProduct.customQuantity,
            min_quantity: updatedProduct.minQuantity,
            max_quantity: updatedProduct.maxQuantity,
            allow_custom_dimensions: updatedProduct.allowCustomDimensions,
            is_new: updatedProduct.isNew,
            is_featured: updatedProduct.isFeatured,
            is_best_seller: updatedProduct.isBestSeller,
            full_description: updatedProduct.fullDescription,
            subcategory: updatedProduct.subcategory,
            unit: updatedProduct.unit,
            color: updatedProduct.color,
            price_per_m2: updatedProduct.pricePerM2,
            custom_text: updatedProduct.customText,
            has_design_option: updatedProduct.hasDesignOption,
            price_breakdowns: updatedProduct.priceBreakdowns
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
        const { id, ...rest } = product;

        const safePayload = {
            title: `${product.title} (Cópia)`,
            description: product.description,
            price: Number(product.price) || 0,
            category: product.category,
            active: false,
            image: product.image,
            images: product.images,
            variations: product.variations,
            technical_specs: product.technicalSpecs,
            quantities: product.quantities,
            formats: product.formats,
            finishes: product.finishes,
            printing: product.printing,
            extras: product.extras,
            option_illustrations: product.optionIllustrations,
            custom_quantity: product.customQuantity,
            min_quantity: product.minQuantity,
            max_quantity: product.maxQuantity,
            allow_custom_dimensions: product.allowCustomDimensions,
            is_new: product.isNew,
            is_featured: product.isFeatured,
            is_best_seller: product.isBestSeller,
            full_description: product.fullDescription,
            subcategory: product.subcategory,
            unit: product.unit,
            color: product.color,
            price_per_m2: product.pricePerM2,
            custom_text: product.customText,
            has_design_option: product.hasDesignOption,
            price_breakdowns: product.priceBreakdowns
        };

        const { data, error } = await supabase.from('products').insert([safePayload]).select().single();
        if (data && !error) {
            setProducts(prev => [mapProductFromDB(data), ...prev]);
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
            price: Number(p.price) || 0,
            category: p.category,
            active: p.active,
            image: p.image,
            images: p.images,
            variations: p.variations,
            technical_specs: p.technicalSpecs,
            quantities: p.quantities,
            formats: p.formats,
            finishes: p.finishes,
            custom_quantity: p.customQuantity,
            min_quantity: p.minQuantity,
            max_quantity: p.maxQuantity,
            allow_custom_dimensions: p.allowCustomDimensions,
            is_new: p.isNew,
            is_featured: p.isFeatured,
            is_best_seller: p.isBestSeller,
            full_description: p.fullDescription,
            subcategory: p.subcategory,
            unit: p.unit,
            color: p.color,
            price_per_m2: p.pricePerM2,
            custom_text: p.customText,
            has_design_option: p.hasDesignOption,
            price_breakdowns: p.priceBreakdowns,
            printing: p.printing,
            extras: p.extras,
            option_illustrations: p.optionIllustrations
        }));

        const { data, error } = await supabase.from('products').insert(safeProducts).select();
        if (data && !error) setProducts(prev => [...data, ...prev]);
    };

    const addCategory = async (category: Category) => {
        const safeCategory = {
            id: category.id,
            name: category.name,
            parent_id: category.parentId || null, // Ensure empty string is null for FK
            image: category.image,
            icon: category.icon,
            show_on_home: category.showOnHome,
            show_on_menu: category.showOnMenu,
            order_index: category.order_index
        };

        const { data, error } = await supabase.from('categories').insert([safeCategory]).select().single();
        if (data && !error) {
            setCategories(prev => [...prev, data]);
            return { success: true, data };
        }
        console.error("Error adding category:", error);
        return { success: false, error };
    };

    const updateCategory = async (updatedCategory: Category) => {
        const safeCategory = {
            name: updatedCategory.name,
            parent_id: updatedCategory.parentId || null, // Ensure empty string is null for FK
            image: updatedCategory.image,
            icon: updatedCategory.icon,
            show_on_home: updatedCategory.showOnHome,
            show_on_menu: updatedCategory.showOnMenu,
            order_index: updatedCategory.order_index
        };

        const { error } = await supabase.from('categories').update(safeCategory).eq('id', updatedCategory.id);
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


    // remove useEffect for coupons load/save as it is handled by fetchData and addCoupon actions

    const addCoupon = async (coupon: Partial<Coupon>) => {
        try {
            const payload = {
                ...coupon,
                limit_per_user: coupon.limitPerUser
            };
            // Remove camelCase version before insert
            delete (payload as any).limitPerUser;

            const { data, error } = await supabase.from('coupons').insert([payload]).select().single();
            if (error) throw error;
            if (data) {
                const mappedCoupon = {
                    ...data,
                    limitPerUser: data.limit_per_user,
                    usageCount: data.usage_count
                };
                setCoupons(prev => [...prev, mappedCoupon]);
                return { success: true, data: mappedCoupon };
            }
            return { success: false, error: 'No data returned' };
        } catch (error) {
            console.error("Error adding coupon:", error);
            return { success: false, error };
        }
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
    // If context is undefined, it means we're likely in a page that skipped the provider 
    // or during a hot-reload. We return a safe empty state instead of crashing.
    if (context === undefined) {
        return {
            products: [],
            categories: [],
            orders: [],
            coupons: [],
            stats: { totalSales: 0, pendingOrders: 0, totalProducts: 0, totalCustomers: 0 },
            addProduct: async () => ({ success: false }),
            updateProduct: async () => ({ success: false }),
            deleteProduct: async () => {},
            duplicateProduct: async () => {},
            importProducts: async () => {},
            addCategory: async () => ({ success: false }),
            updateCategory: async () => {},
            deleteCategory: async () => {},
            updateOrderStatus: async () => {},
            deleteOrder: async () => ({ success: false }),
            addCoupon: async () => ({ success: false }),
            deleteCoupon: async () => {},
        } as unknown as AdminContextType;
    }
    return context;
}
