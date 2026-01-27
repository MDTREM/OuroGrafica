import { getPosts, getSpecificPosts } from "@/actions/blog-actions";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export async function BlogPreviewSection({ title, postIds }: { title?: string, postIds?: string[] }) {
    let posts;
    if (postIds && postIds.length > 0) {
        posts = await getSpecificPosts(postIds);
    } else {
        posts = await getPosts(3); // Fetch only 3 latest posts
    }

    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <Container>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-[#FF6B07] font-bold text-sm uppercase tracking-wider mb-1 block">Nosso Blog</span>
                        <h2 className="text-xl font-bold text-foreground">{title || "Dicas & Novidades"}</h2>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-2 text-[#FF6B07] font-medium hover:gap-3 transition-all">
                        Ver todos os artigos
                        <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.map((post: any) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                            <article className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white">
                                <div className="aspect-[16/9] overflow-hidden relative">
                                    <img
                                        src={post.cover_image || 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2 uppercase tracking-wide font-medium">
                                        <Calendar size={12} />
                                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FF6B07] transition-colors text-base">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-3 flex-1 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <span className="text-[#FF6B07] text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                                        Ler mais <ArrowRight size={14} />
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
