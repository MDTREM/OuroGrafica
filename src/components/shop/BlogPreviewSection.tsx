import { getPosts } from "@/actions/blog-actions";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export async function BlogPreviewSection({ title }: { title?: string }) {
    const posts = await getPosts(3); // Fetch only 3 latest posts

    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <Container>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-[#FF6B07] font-bold text-sm uppercase tracking-wider mb-2 block">Nosso Blog</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title || "Dicas & Novidades"}</h2>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-2 text-[#FF6B07] font-medium hover:gap-3 transition-all">
                        Ver todos os artigos
                        <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                            <article className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white">
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={post.cover_image || 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <Calendar size={14} />
                                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FF6B07] transition-colors text-lg">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <span className="text-[#FF6B07] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                                        Ler mais <ArrowRight size={16} />
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-[#FF6B07] font-medium border border-[#FF6B07] px-6 py-3 rounded-full hover:bg-[#FF6B07] hover:text-white transition-all">
                        Visitar Blog
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
