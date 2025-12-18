import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoryBySlug, getProductsByCategory } from "@/actions/product-actions";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const categoryId = slug[0];
    const subcategoryId = slug[1];

    // 1. Fetch Category Info
    const category = await getCategoryBySlug(categoryId);

    // Fallback names if category not found in DB (or strictly rely on DB response)
    const categoryName = category?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

    const subcategoryName = subcategoryId ? subcategoryId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";
    const title = subcategoryId ? `${categoryName} - ${subcategoryName}` : categoryName;

    // 2. Parse Filters
    const priceParam = resolvedSearchParams.price as string | undefined;
    const deadlineParam = resolvedSearchParams.deadline as string | undefined;

    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceParam === 'low') { maxPrice = 50; }
    else if (priceParam === 'mid') { minPrice = 50; maxPrice = 100; }
    else if (priceParam === 'high') { minPrice = 100; }

    // 3. Fetch Products
    const products = await getProductsByCategory(categoryId, {
        minPrice,
        maxPrice,
        deadline: deadlineParam
    });

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
                </Container>
            </div>

            {/* Content */}
            <Container className="py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <FilterSidebar />

                    {/* Product Grid */}
                    <div className="flex-1">
                        {products.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                                <p className="text-gray-500">Não encontramos produtos nesta categoria no momento.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
