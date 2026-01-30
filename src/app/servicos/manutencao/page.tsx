import { Container } from "@/components/ui/Container";
import { Wrench, Printer, AlertTriangle, Wifi } from "lucide-react";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { MaintenanceForm } from "@/components/services/MaintenanceForm";
import { getPagesConfig } from "@/actions/homepage-actions";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manutenção de Impressoras em Ouro Preto | Ouro Gráfica",
    description: "Conserto e manutenção de impressoras Epson, Canon, HP e Brother. Troca de almofadas, limpeza de cabeçote e peças. Orçamento grátis no WhatsApp!",
};

const BRANDS = [
    { name: 'Epson', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Epson_logo.svg/2560px-Epson_logo.svg.png' },
    { name: 'Canon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canon_logo.svg/2560px-Canon_logo.svg.png' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png' },
    { name: 'Brother', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Brother_logo.svg/2560px-Brother_logo.svg.png' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg' },
    { name: 'Ricoh', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ricoh_logo_2005.svg/1280px-Ricoh_logo_2005.svg.png' },
    { name: 'Xerox', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Xerox_logo.svg/1280px-Xerox_logo.svg.png' }
];

const problems = [
    {
        icon: Printer,
        title: "Falhas na Impressão",
        description: "Manchas, riscos, cores erradas ou falhas brancas. Resolvemos entupimentos e problemas de cabeçote.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        icon: AlertTriangle,
        title: "Luzes Piscando",
        description: "Almofadas de tinta cheias (Reset), erro geral ou atolamento de papel. Diagnóstico preciso via software.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        icon: Wrench,
        title: "Não Liga ou Não Puxa",
        description: "Problemas na fonte, placa lógica ou mecanismos de tração de papel. Reparo eletrônico completo.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        icon: Wifi,
        title: "Configuração de Rede",
        description: "Instalação de drivers, configuração de Wi-Fi e conexão com celulares e computadores.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    }
];

export default async function ManutencaoPage() {
    const config = await getPagesConfig();
    const banners = (config.maintenanceBanners && config.maintenanceBanners.length > 0)
        ? config.maintenanceBanners
        : [{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1599589392233-01d0c950a998?q=80&w=2070&auto=format&fit=crop' }];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Manutenção de Impressoras em Ouro Preto",
        "description": "Conserto e manutenção especializada de impressoras Epson, Canon, HP e Brother. Troca de peças, limpeza de cabeçote e reset de almofadas.",
        "provider": {
            "@type": "LocalBusiness",
            "name": "Ouro Gráfica",
            "image": "https://ourografica.site/icon.png",
            "telephone": "+5531982190935",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua José Moringa, 9",
                "addressLocality": "Ouro Preto",
                "addressRegion": "MG",
                "postalCode": "35400-000",
                "addressCountry": "BR"
            }
        },
        "areaServed": [
            { "@type": "City", "name": "Ouro Preto" },
            { "@type": "City", "name": "Mariana" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços de Manutenção",
            "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Troca de Almofadas de Impressora" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpeza de Cabeçote de Impressão" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Instalação de Bulk Ink" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Reparo de Placa Lógica" } }
            ]
        }
    };

    return (
        <div className="bg-white pb-20 pt-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Banner Section - Admin Editable */}
            <Container>
                <div className="relative w-full bg-black overflow-hidden group shadow-lg rounded-lg mb-12">
                    {/* Hero Carousel */}
                    <HeroCarousel banners={banners} altText="Manutenção de Impressoras Ouro Gráfica" />
                </div>

                {/* SEO Text Section */}
                <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Manutenção de Impressoras em Ouro Preto e Região
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        Sua impressora parou? A <strong>Ouro Gráfica</strong> é especialista em manutenção de impressoras.
                        Oferecemos diagnóstico rápido, peças originais e garantia no serviço.
                        Atendemos empresas e residências, resolvendo desde falhas de impressão até erros complexos de hardware.
                    </p>
                </div>
            </Container>

            {/* Brands Carousel (Infinite Scroll) */}
            <div className="py-10 overflow-hidden bg-white">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        animation: scroll 5s linear infinite;
                    }
                `}} />
                <Container>
                    <div className="flex items-center gap-4 mb-6 justify-between">
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900">Marcas Parceiras</h3>
                    </div>

                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        <div className="flex animate-scroll whitespace-nowrap items-center">
                            {/* Quadruple the list for seamless loop on large screens */}
                            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale opacity-100 transition-all duration-300 mr-16">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>

            {/* Common Problems (Grid 2x2) */}
            <div className="py-8">
                <Container>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-8">Problemas Comuns</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {problems.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex gap-4 items-start">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.colorBg} ${item.colorText}`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Pre-Quote Form */}
            <div className="py-8 bg-gray-50/50">
                <Container>
                    <MaintenanceForm />
                </Container>
            </div>
        </div>
    );
}
