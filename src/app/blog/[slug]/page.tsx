import { getPostBySlug } from '@/actions/blog-actions';
import { Container } from '@/components/ui/Container';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Share2, Facebook, Linkedin, Twitter, Clock, Tag } from 'lucide-react';

interface Props {
    params: { slug: string };
}

// Fixed base URL
const BASE_URL = 'https://ourografica.site';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return { title: 'Post não encontrado | Ouro Gráfica' };
    }

    // Prioritize SEO fields, fallback to content
    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || post.title;

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/blog/${post.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `${BASE_URL}/blog/${post.slug}`,
            images: post.cover_image ? [{ url: post.cover_image, alt: post.alt_text || post.title }] : [],
            publishedTime: post.created_at,
            authors: ['Ouro Gráfica'],
            section: post.category || 'Dicas',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.cover_image ? [post.cover_image] : [],
        },
        keywords: post.tags || []
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    // JSON-LD Schema for Article
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.meta_title || post.title,
        "description": post.meta_description || post.excerpt,
        "image": post.cover_image ? [post.cover_image] : [],
        "datePublished": post.created_at,
        "dateModified": post.created_at, // Ideally we should have an updated_at column
        "author": {
            "@type": "Organization",
            "name": "Ouro Gráfica",
            "url": BASE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "Ouro Gráfica",
            "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/icon.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${BASE_URL}/blog/${post.slug}`
        }
    };

    return (
        <article className="min-h-screen bg-white">
            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            {/* Hero Header */}
            <div className="w-full h-[40vh] md:h-[50vh] relative bg-gray-900">
                <div className="absolute inset-0 opacity-60 bg-black z-10" />
                <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'}
                    alt={post.alt_text || post.title}
                    className="w-full h-full object-cover absolute inset-0 text-transparent"
                />

                <div className="absolute inset-0 z-20 flex items-end pb-12 md:pb-20">
                    <Container>
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-block px-3 py-1 bg-[#FF6B07] text-white text-xs font-bold uppercase tracking-wider rounded">
                                    {post.category || 'Dica Ouro Gráfica'}
                                </span>
                                {post.is_featured && (
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-wider rounded">
                                        Destaque
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl md:leading-tight font-bold text-white mb-6 drop-shadow-lg">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    {new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={16} />
                                    Leitura de 5 min
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
                    </div>

                    {/* Main Text */}
                    <div className="md:col-span-10">
                        <div
                            className="prose prose-lg prose-slate max-w-none
                            prose-headings:font-bold prose-headings:text-gray-900
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-4 prose-h2:border-gray-100
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-[#FF6B07]
                            prose-p:leading-relaxed prose-p:text-gray-600 prose-p:mb-6
                            prose-a:text-[#FF6B07] prose-a:font-bold prose-a:no-underline hover:prose-a:text-[#e65a00] hover:prose-a:underline
                            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full
                            prose-blockquote:border-l-4 prose-blockquote:border-[#FF6B07] prose-blockquote:bg-orange-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
                            prose-li:marker:text-[#FF6B07]"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag size={16} />
                                    Tags Relacionadas:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-default">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mobile Share */}
                        <div className="mt-8 pt-8 md:hidden flex items-center gap-4 justify-center border-t border-gray-100">
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
