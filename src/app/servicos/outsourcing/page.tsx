import { Container } from "@/components/ui/Container";
import { CheckCircle } from "lucide-react";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { OutsourcingForm } from "@/components/services/OutsourcingForm";
import { OutsourcingMap } from "@/components/services/OutsourcingMap";
import { getPagesConfig } from "@/actions/homepage-actions";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aluguel de Impressoras em Ouro Preto e Região | Outsourcing",
    description: "Reduza custos com aluguel de impressoras para empresas em Ouro Preto, Mariana e Itabirito. Manutenção e toner inclusos. Planos personalizados para sua empresa.",
    keywords: ["Aluguel de Impressoras Ouro Preto", "Locação de Impressoras Mariana", "Outsourcing de Impressão", "Aluguel Multifuncional", "Ouro Gráfica Impressoras"],
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

const advantages = [
    {
        title: "Redução de Custos",
        text: "Elimine custos com compra de equipamentos e reduza gastos com suprimentos e manutenções imprevistas.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        title: "Produtividade",
        text: "Integre equipamentos e soluções de alta performance para otimizar seus processos de impressão.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        title: "Manutenção Inclusa",
        text: "Esqueça a dor de cabeça com impressoras paradas. Nossa assistência técnica garante o funcionamento contínuo.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        title: "Atendimento Regional",
        text: "Atendimento técnico rápido e presencial para empresas em Ouro Preto, Mariana, Itabirito e toda a Região dos Inconfidentes.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        title: "Gestão e Controle",
        text: "Tenha total controle sobre o volume de impressão, eliminando desperdícios e estoques com suprimentos e peças.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    },
    {
        title: "Conformidade Ambiental",
        text: "O descarte de toners é realizado de forma correta e ecológica em conformidade com as normas da ISO 9001 e ISO 14001.",
        colorBg: "bg-orange-50",
        colorText: "text-orange-600"
    }
];

const equipments = [
    {
        title: "Ricoh 430F (P&B)",
        text: "Multifuncional monocromática robusta e compacta, ideal para alto volume, com digitalização rápida e baixíssimo custo por página.",
        image: "https://assets.rbl.ms/31808381/origin.png"
    },
    {
        title: "Epson 5890 (Colorida)",
        text: "Impressora colorida de alto desempenho com tecnologia PrecisionCore, oferecendo qualidade laser com maior economia de tinta e energia.",
        image: "https://mediaserver.goepson.com/ImConvServlet/imconv/661d5462c4ab1581341d2d4a22014a60f6009a0a/515Wx515H?use=productpictures&hybrisId=B2C&assetDescr=WF-C5890_SPT_C11CK23201_384x286"
    },
    {
        title: "Epson WF-7840 (A3 Color)",
        text: "Multifuncional A3 colorida versátil, perfeita para impressões de grande formato, plantas e gráficos vibrantes com alta precisão.",
        image: "https://m.media-amazon.com/images/I/61-jQGhEY6L._AC_SX466_.jpg"
    },
    {
        title: "Xerox Versalink C500",
        text: "Impressora colorida confiável e segura, com interface intuitiva estilo tablet e conectividade móvel avançada para escritórios modernos.",
        image: "https://www.xerox.com/assets/images/brand_engine/products/hardware/VLC505/VLC505_demo_600x400.jpg"
    }
];

export default async function OutsourcingPage() {
    const config = await getPagesConfig();
    const banners = (config.outsourcingBanners && config.outsourcingBanners.length > 0)
        ? config.outsourcingBanners
        : [{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop' }];

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-6">
            {/* Banner Section */}
            <Container>
                <div className="relative w-full aspect-[108/46] md:aspect-auto md:h-[300px] bg-black overflow-hidden group shadow-lg rounded-lg">
                    {/* Hero Carousel */}
                    <HeroCarousel banners={banners} altText="Aluguel de Impressoras em Ouro Preto" />
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
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900">Trabalhamos com as Melhores Marcas</h3>
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

            {/* SEO Content Section */}
            <div className="py-12 bg-white border-b border-gray-100">
                <Container className="max-w-4xl text-center space-y-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Aluguel de Impressoras em <span className="text-brand">Ouro Preto, Mariana e Itabirito</span>
                    </h1>

                    <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
                        <p>
                            O serviço de <strong>Outsourcing de Impressão</strong> da Ouro Gráfica é a solução ideal para empresas que buscam
                            reduzir custos e aumentar a produtividade. Fornecemos equipamentos modernos das marcas <strong>Ricoh, Epson e Brother</strong>.
                        </p>
                        <p>
                            Esqueça a preocupação com compra de toners, peças de reposição e manutenção técnica.
                            Com nossa locação, tudo isso está incluso no contrato. Sua empresa foca no negócio, e nós garantimos
                            a impressão de qualidade.
                        </p>
                    </div>

                    <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <span className="block text-xl font-bold text-brand mb-1">-40%</span>
                            <span className="text-xs text-gray-500 font-medium uppercase">de Custos</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <span className="block text-xl font-bold text-brand mb-1">24h</span>
                            <span className="text-xs text-gray-500 font-medium uppercase">Suporte Técnico</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <span className="block text-xl font-bold text-brand mb-1">Zero</span>
                            <span className="text-xs text-gray-500 font-medium uppercase">Investimento Inicial</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <span className="block text-xl font-bold text-brand mb-1">100%</span>
                            <span className="text-xs text-gray-500 font-medium uppercase">Dedutível no IR</span>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="space-y-20 pt-12">

                {/* Vantagens */}
                <div className="space-y-12">
                    <div className="text-left space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Vantagens de alugar</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {advantages.map((adv, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex gap-4 items-start">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${adv.colorBg} ${adv.colorText}`}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{adv.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{adv.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Onde Atuamos (MG Map) */}
                <OutsourcingMap />

                {/* Equipamentos */}
                <div className="space-y-12">
                    <div className="text-left">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Conheça nossos Equipamentos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {equipments.map((eq, idx) => (
                            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="h-64 overflow-hidden flex items-center justify-center p-4">
                                    <img src={eq.image} alt={eq.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800">{eq.title}</h3>
                                    <p className="text-gray-600">{eq.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulário - Maintenance Style */}
                <OutsourcingForm />
            </Container>
        </div>
    );
}


