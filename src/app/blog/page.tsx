import { getPosts } from '@/actions/blog-actions';
import { Container } from '@/components/ui/Container';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog | Ouro Gráfica - Dicas de Impressão e Manutenção',
    description: 'Confira nossas dicas sobre manutenção de impressoras, escolha de papéis, design gráfico e muito mais. Ouro Gráfica, sua parceira em Ouro Preto.',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <Container>

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[#FF6B07] font-bold text-sm uppercase tracking-wider mb-2 block">Nosso Blog</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Dicas & Novidades</h1>
                    <p className="text-gray-600 text-lg">
                        Conteúdos exclusivos sobre o mundo da impressão, manutenção e design para ajudar você e sua empresa.
                    </p>
                </div>

                {/* Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                                <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                                        <img
                                            src={post.cover_image || 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                Ouro Gráfica
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#FF6B07] transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                                            {post.excerpt}
                                        </p>
                                        <span className="text-[#FF6B07] font-bold text-sm flex items-center gap-2">
                                            Ler Artigo Completo
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum artigo ainda 😢</h3>
                        <p className="text-gray-500">Estamos preparando conteúdos incríveis. Volte em breve!</p>
                    </div>
                )}
            </Container>
        </div>
    );
}
