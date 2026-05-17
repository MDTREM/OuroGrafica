import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { getCases } from "@/actions/portfolio-actions";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Vink | Cases de Sucesso",
    description: "Conheça as marcas que transformamos. Portfólio de identidade visual e embalagens para o nicho de gastronomia.",
};

// Next.js Revalidation
export const revalidate = 60;

export default async function PortfolioPage() {
    const cases = await getCases();

    return (
        <div className="bg-[#fcfcfc] min-h-screen pt-32 pb-24 selection:bg-brand selection:text-white">
            <Container>
                <div className="max-w-3xl mb-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-black tracking-tight mb-6">
                        Nossas <span className="text-brand font-bold italic pr-2">Criações</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-light leading-relaxed">
                        Marcas gastronômicas que transformamos recentemente. De embalagens virais a identidades visuais completas.
                    </p>
                </div>

                {cases.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 font-light border border-dashed border-gray-200 rounded-2xl">
                        Nenhum case publicado no momento. Volte em breve!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cases.map((item) => (
                            <Link href={`/portfolio/${item.slug}`} key={item.id} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                                    {item.cover_image ? (
                                        <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">Sem Imagem</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-black">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="text-xl font-medium text-black mb-2 group-hover:text-brand transition-colors">{item.title}</h2>
                                    <p className="text-sm text-gray-500 font-light line-clamp-3 mb-6 flex-1">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-brand">
                                        Ver Case Completo <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
