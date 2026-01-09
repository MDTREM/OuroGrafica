import { getPostBySlug } from '@/actions/blog-actions';
import { Container } from '@/components/ui/Container';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Share2, Facebook, Linkedin, Twitter } from 'lucide-react';

interface Props {
    params: { slug: string };
}

// Dynamic SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return { title: 'Post não encontrado' };
    }

    return {
        title: `${post.title} | Blog Ouro Gráfica`,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            images: post.cover_image ? [post.cover_image] : [],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="w-full h-[40vh] md:h-[50vh] relative bg-gray-900">
                <div className="absolute inset-0 opacity-50 bg-black z-10" />
                <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'}
                    alt={post.title}
                    className="w-full h-full object-cover absolute inset-0 text-transparent"
                />

                <div className="absolute inset-0 z-20 flex items-end pb-12 md:pb-20">
                    <Container>
                        <div className="max-w-4xl mx-auto">
                            <span className="inline-block px-3 py-1 bg-[#FF6B07] text-white text-xs font-bold uppercase tracking-wider rounded mb-4">
                                Dica Ouro Gráfica
                            </span>
                            <h1 className="text-3xl md:text-5xl md:leading-tight font-bold text-white mb-6 drop-shadow-lg">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-6 text-gray-300 text-sm">
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    {new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    5 min de leitura
                                </span>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>

            {/* Content Body */}
            <Container className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Share Sidebar (Desktop) */}
                    <div className="hidden md:block md:col-span-1 space-y-4 sticky top-24 h-fit">
                        <p className="text-xs text-center font-bold text-gray-400 uppercase tracking-widest mb-2">Share</p>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all">
                            <Facebook size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all">
                            <Twitter size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#0A66C2] hover:text-white transition-all">
                            <Linkedin size={18} />
                        </button>
                    </div>

                    {/* Main Text */}
                    <div className="md:col-span-10">
                        <div
                            className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-[#FF6B07] hover:prose-a:text-[#e65a00] max-w-none
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                            prose-p:leading-relaxed prose-p:text-gray-600
                            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Mobile Share */}
                        <div className="mt-12 pt-8 border-t border-gray-200 md:hidden flex items-center gap-4 justify-center">
                            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Share2 size={16} />
                                Compartilhar:
                            </span>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all">
                                    <Facebook size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all">
                                    <Twitter size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </article>
    );
}
