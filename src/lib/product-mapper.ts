import { Product } from "@/data/mockData";

// Helper to map DB columns to Product interface
export function mapProduct(p: any): Product {
    return {
        ...p,
        customText: p.custom_text,
        technicalSpecs: p.technical_specs || {},
        hasDesignOption: p.has_design_option !== undefined ? p.has_design_option : true,
        priceBreakdowns: p.price_breakdowns || {},
        formatPrices: p.technical_specs?.formatPrices || p.formatPrices || {},
        finishPrices: p.technical_specs?.finishPrices || p.finishPrices || {},
        printingPrices: p.technical_specs?.printingPrices || p.printingPrices || {},
        extraPrices: p.technical_specs?.extraPrices || p.extraPrices || {}
    } as Product;
}
