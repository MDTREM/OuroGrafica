import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://ourografica.site'; // Substitua pelo seu domínio real

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/perfil/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
