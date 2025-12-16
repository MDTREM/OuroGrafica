
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
export default function CategoriesPage() {
    const categories = [
        {
            name: "Cartões de Visita",
            slug: "cartoes",
            description: "Couchê, PVC, Metalizado e mais"
        },
        {
            name: "Banners",
            slug: "banners",
            description: "Lona Brilho, Fosca e Roll-up"
        },
        {
            name: "Adesivos",
            slug: "adesivos",
            description: "Vinil, Papel e Recorte Especial"
        },
        {
            name: "Flyers e Panfletos",
            slug: "flyers",
            description: "Divulgue sua marca com qualidade"
        },
        {
            name: "Crachás e Cordões",
            slug: "crachas",
            description: "Identificação para empresas e eventos"
        },
        {
            name: "Pastas",
            slug: "pastas",
            description: "Apresentação profissional"
        },
        {
            name: "Cardápios",
            slug: "cardapios",
            description: "PVC, Plastificado e Americano"
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-center">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <LayoutGrid size={20} className="text-brand" />
                    Todas as Categorias
                </h1>
            </div>

            <Container className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/categoria/${cat.slug}`}
                                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-brand/30 transition-all group"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-brand" />
                            </Link>
                        );
                    })}
                </div>

                {/* Search Prompt */}
                <div className="mt-8 text-center bg-brand/5 rounded-xl p-6 border border-brand/10">
                    <p className="text-sm text-gray-600 mb-2">Não encontrou o que procura?</p>
                    <Link href="/" className="inline-block text-brand font-bold hover:underline">
                        Voltar para a Loja e Buscar
                    </Link>
                </div>
            </Container>
        </div>
    );
}
