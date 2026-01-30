import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ouro Gráfica | Impressão e Manutenção',
        short_name: 'Ouro Gráfica',
        description: 'Gráfica rápida, manutenção de impressoras e outsourcing em Ouro Preto e região.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ea580c', // Orange-600 used in the app
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            // Assuming standard icon paths or just using favicon for now as placeholder
            // In a real scenario we'd want 192x192 and 512x512 pngs
        ],
    };
}
