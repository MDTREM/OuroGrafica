
export interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    unit?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    image?: string;
    images?: string[]; // Array of images
    color?: string; // For placeholder/UI theming
    active?: boolean;

    // Extended Details
    subcategory?: string;
    fullDescription?: string;
    technicalSpecs?: {
        paper?: string; // Papel/Material
        colors?: string; // Cores (4x0, 4x4)
        weight?: string; // Gramatura
        finalSize?: string; // Tamanho Final
        productionTime?: string; // Prazo de Produção
        // Others can be added dynamically or map
        [key: string]: string | undefined;
    };

    // Variations/Options
    quantities?: string[]; // ["100 un.", "500 un."]
    formats?: string[]; // ["9x5cm", "Quadrado"]
    finishes?: string[]; // ["Verniz Local", "Laminação Fosca"]

    // Dynamic Variations (New)
    variations?: {
        name: string;
        options: string[];
        prices?: { [key: string]: number }; // Optional price override per option
        images?: { [key: string]: string }; // Optional image override per option
    }[];

    customQuantity?: boolean;
    minQuantity?: number;
    maxQuantity?: number;

    // Price Table (Quantity -> Total Price)
    priceBreakdowns?: {
        [quantity: number]: number;
    };

    // Custom Dimensions (m2)
    allowCustomDimensions?: boolean; // If true, show width/height inputs
    pricePerM2?: number; // Optional override if price logic differs from base price

    // Custom Text Input (Personalization)
    customText?: {
        enabled: boolean;
        label: string;
        placeholder?: string;
        required?: boolean;
    };

    // Design Option (Upload/Hire)
    hasDesignOption?: boolean;
}

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

export interface Category {
    id: string;
    name: string;
    parentId?: string;
    image?: string;
    icon?: string; // Lucide icon name
    showOnHome?: boolean;
    showOnMenu?: boolean;
    order_index?: number;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    active: boolean;
    usageCount?: number;
}

export const USER: User = {
    name: "Ouro Gráfica",
    email: "conta@ourografica.com"
};

export const CONSTANTS = {
    SHIPPING: 0
};

export const CATEGORIES: Category[] = [
    { id: "todos", name: "Todos" },
    { id: "cartoes", name: "Cartões" },
    { id: "banners", name: "Banners" },
    { id: "adesivos", name: "Adesivos" },
    { id: "flyers", name: "Flyers" },
    { id: "crachas", name: "Crachás" },
    { id: "pastas", name: "Pastas" },
];

export const PRODUCTS: Product[] = [
    {
        id: "1",
        title: "Cartão de Visita Premium",
        description: "Papel couchê 300g com verniz localizado. Ideal para causar uma excelente primeira impressão.",
        category: "Cartões",
        price: 49.90,
        unit: "100 un.",
        isNew: true,
        isBestSeller: true,
        isFeatured: true,
        color: "bg-blue-200"
    },
    {
        id: "2",
        title: "Banner Roll-Up",
        description: "Ideal para eventos e estandes. Fácil transporte e montagem rápida.",
        category: "Banners",
        price: 120.00,
        unit: "1 un.",
        isNew: true,
        isBestSeller: true,
        isFeatured: true,
        color: "bg-yellow-200"
    },
    {
        id: "3",
        title: "Adesivos em Vinil",
        description: "Corte especial, resistente à água e sol. Perfeito para vitrines e carros.",
        category: "Adesivos",
        price: 35.00,
        unit: "50 un.",
        isNew: false,
        isBestSeller: true,
        isFeatured: false,
        color: "bg-green-200"
    },
    {
        id: "4",
        title: "Papelaria Corporativa",
        description: "Timbrados, envelopes e pastas personalizadas. Profissionalismo no dia a dia.",
        category: "Papelaria",
        price: 80.00,
        unit: "Kit",
        isNew: false,
        isBestSeller: true,
        isFeatured: true,
        color: "bg-gray-200"
    },
    {
        id: "5",
        title: "Flyer A5 Couchê 115g",
        description: "Divulgue seu negócio com alta qualidade e baixo custo. Impressão frente e verso.",
        category: "Flyers",
        price: 89.00,
        unit: "1000 un.",
        isNew: false,
        isBestSeller: false,
        isFeatured: true,
        color: "bg-purple-200"
    },
    {
        id: "6",
        title: "Cartão Fidelidade",
        description: "Fidelize seus clientes com um cartão prático e bonito. Verso em papel poroso para carimbo.",
        category: "Cartões",
        price: 45.00,
        unit: "100 un.",
        isNew: false,
        isBestSeller: false,
        isFeatured: false,
        color: "bg-pink-200"
    },
    {
        id: "7",
        title: "Tag para Roupas",
        description: "Agregue valor aos seus produtos têxteis com tags personalizadas.",
        category: "Tags",
        price: 55.00,
        unit: "100 un.",
        isNew: true,
        isBestSeller: false,
        isFeatured: false,
        color: "bg-red-200"
    }
];
