import { Container } from "@/components/ui/Container";
import { getCaseBySlug, getCases } from "@/actions/portfolio-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCaseBySlug(slug);
    if (!data) return { title: "Case não encontrado" };

    return {
        title: `${data.title} | Vink Cases`,
        description: data.description,
        openGraph: {
            images: [data.cover_image],
        },
    };
}

export async function generateStaticParams() {
    const cases = await getCases(100);
    return cases.map((item) => ({
        slug: item.slug,
    }));
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const caseData = await getCaseBySlug(slug);

    if (!caseData || !caseData.published) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900 selection:bg-brand selection:text-white">
            <Container className="max-w-4xl">
                <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand font-medium mb-12 transition-colors">
                    <ArrowLeft size={16} />
                    Voltar para Cases
                </Link>

                <div className="mb-12">
                    <div className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                        {caseData.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
                        {caseData.title}
                    </h1>
                    <p className="text-xl text-gray-500 font-light leading-relaxed">
                        {caseData.description}
                    </p>
                </div>
            </Container>

            <Container className="max-w-6xl mb-16">
                <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {caseData.cover_image && (
                        <img src={caseData.cover_image} alt={`Capa ${caseData.title}`} className="w-full h-full object-cover" />
                    )}
                </div>
            </Container>

            <Container className="max-w-4xl">
                {caseData.content && (
                    <div className="prose prose-lg prose-gray max-w-none mb-20 whitespace-pre-wrap font-light text-gray-600 leading-relaxed">
                        {caseData.content}
                    </div>
                )}

                {caseData.images && caseData.images.length > 0 && (
                    <div className="border-t border-gray-100 pt-16">
                        <h2 className="text-2xl font-medium mb-10 text-center text-black">Galeria do Projeto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {caseData.images.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
