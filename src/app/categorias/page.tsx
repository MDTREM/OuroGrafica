import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ChevronRight, LayoutGrid, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function CategoriesPage() {
    const { data: categories } = await supabase.from('categories').select('*');

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
                    {categories?.map((cat) => {

                        return (
                            <Link
                                key={cat.id}
                                href={`/categoria/${cat.id}`}
                                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-brand/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    {cat.image ? <img src={cat.image} className="w-full h-full object-cover rounded-lg" /> : <ImageIcon size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{cat.id}</p>
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
