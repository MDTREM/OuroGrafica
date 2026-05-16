import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://vink.com.br';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/perfil/',
                '/api/',
                '/_next/',
                '/private/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
