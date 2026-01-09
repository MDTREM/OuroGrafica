import { getPosts } from '@/actions/blog-actions';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ourografica.site';

    // 1. Static Pages
    const routes = [
        '', // home
        '/servicos/manutencao',
        '/servicos/outsourcing',
        '/blog',
        '/login',
        '/cadastro',
        '/termos-de-uso',
        '/politica-de-privacidade',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Fetch Blog Posts
    const posts = await getPosts();
    const blogRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'monthly' as const, // Content usually doesn't change often
        priority: 0.7,
    }));

    return [...routes, ...blogRoutes];
}
