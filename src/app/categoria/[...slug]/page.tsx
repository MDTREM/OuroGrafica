
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const categoryId = slug[0];
    const subcategoryId = slug[1];

    // Mock Database
    const categoriesMap: Record<string, string> = {
        "cartoes": "Cartões de Visita",
        "banners": "Banners",
        "adesivos": "Adesivos",
        "flyers": "Flyers e Panfletos",
        "crachas": "Crachás e Cordões",
        "pastas": "Pastas",
        "cardapios": "Cardápios",
    };

    const categoryName = categoriesMap[categoryId] || "Categoria";
    const subcategoryName = subcategoryId ? subcategoryId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";
    const title = subcategoryId ? `${categoryName} - ${subcategoryName}` : categoryName;

    // Mock Products
    const products = [
        {
            id: "1",
            title: "Cartão de Visita Premium",
            price: 49.90,
            unit: "100 unid.",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Papel Couchê 300g, Verniz Localizado e Laminação Fosca. O cartão mais vendido.",
        },
        {
            id: "2",
            title: "Flyer A5 Couchê 115g",
            price: 89.00,
            unit: "500 unid.",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Ideal para divulgação em massa. Cores vivas e impressão de alta qualidade.",
        },
        {
            id: "3",
            title: "Adesivo Vinil Redondo 5x5",
            price: 35.50,
            unit: "Cartela",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Resistente à água e sol. Perfeito para embalagens e brindes.",
        },
        {
            id: "4",
            title: "Banner Lona 80x120cm",
            price: 60.00,
            unit: "unid.",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Acabamento com bastão e cordinha. Pronto para pendurar.",
        },
        // More mock items to fill grid
        {
            id: "5",
            title: "Cartão Fidelidade",
            price: 45.00,
            unit: "100 unid.",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Papel reciclado ou offset, ideal para carimbar ou escrever."
        },
        {
            id: "6",
            title: "Tag para Roupas",
            price: 55.00,
            unit: "100 unid.",
            image: "https://i.imgur.com/8Qj9Y2s.png",
            description: "Com furo de 3mm. Destaque sua marca com tags personalizadas."
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <Container className="py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-brand">Home</Link>
                        <ChevronRight size={14} />
                        <Link href={`/categoria/${categoryId}`} className="hover:text-brand">{categoryName}</Link>
                        {subcategoryName && (
                            <>
                                <ChevronRight size={14} />
                                <span className="text-gray-900 font-medium">{subcategoryName}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Encontre os melhores {categoryName.toLowerCase()} para o seu negócio. Qualidade profissional e entrega rápida.
                    </p>
                </Container>
            </div>

            {/* Content */}
            <Container className="py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar (Simple) */}
                    {/* Filters Sidebar */}
                    <FilterSidebar />

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
