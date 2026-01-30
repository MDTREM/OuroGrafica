import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { getProductById } from "@/actions/get-product-by-id";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const product = await getProductById(resolvedParams.id);

    if (!product) {
        return {
            title: "Produto Não Encontrado | Ouro Gráfica",
            description: "O produto que você procura não está disponível."
        };
    }

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

    return {
        title: `${product.title} | Ouro Gráfica`,
        description: product.description || `Compre ${product.title} na Ouro Gráfica. Qualidade e rapidez.`,
        openGraph: {
            title: product.title,
            description: product.description,
            images: images.map(url => ({ url })),
        }
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const resolvedParams = await params;
    const product = await getProductById(resolvedParams.id);

    // Initial check for product existence is handled inside ProductClient or here.
    // Ideally here for 404, but let's pass null to Client to handle "Not Found" UI consistent with before,
    // OR render a simple 404 here.
    // The previous implementation showed a "Produto não encontrado" div.
    // Let's pass the product (or null) to the client component.

    // However, ProductClient expects "product: Product".
    // If null, we should handle it here or adjust ProductClient.
    // Let's render the "Not Found" state here if null, to keep Server Component clean.

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>Produto não encontrado.</p>
                <a href="/" className="text-brand hover:underline">Voltar para a loja</a>
            </div>
        );
    }

    return <ProductClient product={product} />;
}
