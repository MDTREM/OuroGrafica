import { Product } from "@/data/mockData";

// Helper to map DB columns to Product interface
export function mapProduct(p: any): Product {
    return {
        ...p,
        customText: p.custom_text,
        hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : true,
        priceBreakdowns: p.price_breakdowns || {}
    } as Product;
}
