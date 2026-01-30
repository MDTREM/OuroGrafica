import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://ourografica.site';

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
