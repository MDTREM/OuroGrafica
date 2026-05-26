import { Container } from "@/components/ui/Container";
import { Check, Star, Utensils, TrendingUp, Camera, Leaf, ArrowRight, ArrowUpRight, Store } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { getCases } from "@/actions/portfolio-actions";
import Link from "next/link";
import VinkPlansSection from "@/components/ui/VinkPlansSection";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import StickyScroll from "@/components/ui/sticky-scroll";
import BrandingHeroHeadline from "@/components/ui/BrandingHeroHeadline";
import { ImageComparison } from "@/components/ui/image-comparison-slider";
import { BrandingFaq } from "@/components/ui/BrandingFaq";

const FAQ_ITEMS = [
    {
        question: "Quanto tempo leva para criar uma marca completa?",
        answer: "O processo estratégico de branding leva em média de 30 a 45 dias, dependendo da complexidade dos materiais físicos e rodadas de aprovação."
    },
    {
        question: "Vocês também fabricam as embalagens?",
        answer: "Sim! Temos uma rede de parceiros industriais homologados para garantir que o design do papel saia exatamente como o projeto digital, com preços competitivos de fábrica."
    },
    {
        question: "Eu já tenho uma logo. Posso fazer só as embalagens?",
        answer: "Podemos realizar o redesign ou a aplicação de marca em novos suportes, desde que a marca atual comporte um padrão de qualidade VINK. Caso contrário, sugerimos um ajuste técnico."
    }
];

export const metadata = {
    title: "Vink | Branding para Gastronomia",
    description: "Identidade visual que devora a concorrência. Transformamos restaurantes, hamburguerias e deliveries em marcas inesquecíveis.",
};

const BRANDS = [
    "Burger King", "Outback", "Domino's", "Bacio di Latte", "KFC", "Subway", "Madero", "Coco Bambu"
];

export default async function BrandingPage() {
    const portfolioCases = await getCases(12);

    return (
        <div className="bg-white min-h-screen text-gray-900 selection:bg-brand selection:text-white">
            {/* Hero Section */}
            <section className="pt-16 pb-8 md:pt-24 md:pb-12 relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full">
                        <BrandingHeroHeadline />
                        
                        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed font-light">
                            Criamos identidades visuais, embalagens e materiais que geram desejo e fazem seu restaurante parecer uma grande franquia desde o primeiro olhar.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                            <a href="#planos" className="bg-brand text-white rounded-xl px-8 py-4 font-medium transition-colors flex items-center justify-center relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]">
                                <span className="relative z-10 flex items-center justify-center">Ver planos</span>
                            </a>
                            <a href="https://wa.me/5531989880161?text=Olá,%20gostaria%20de%20falar%20sobre%20o%20branding%20do%20meu%20restaurante!" target="_blank" rel="noopener noreferrer" className="bg-white text-brand border border-brand rounded-xl px-8 py-4 font-medium transition-colors flex items-center justify-center relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-gray-50">
                                <span className="relative z-10 flex items-center justify-center">Falar com especialista</span>
                            </a>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Stats */}
            <div className="mt-2 mb-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 max-w-4xl mx-auto text-center divide-x divide-gray-100">
                <div className="px-2">
                    <p className="text-4xl font-light text-black mb-2">
                        <CountUp end={200} prefix="+" />
                    </p>
                    <p className="text-xs font-medium tracking-widest uppercase text-gray-400">Marcas Atendidas</p>
                </div>
                <div className="px-2">
                    <p className="text-4xl font-light text-black mb-2">
                        <CountUp end={98} suffix="%" />
                    </p>
                    <p className="text-xs font-medium tracking-widest uppercase text-gray-400">de Satisfação</p>
                </div>
                <div className="px-2">
                    <p className="text-4xl font-light text-black mb-2">
                        <CountUp end={5} prefix="+" suffix="M" />
                    </p>
                    <p className="text-xs font-medium tracking-widest uppercase text-gray-400">Embalagens Produzidas</p>
                </div>
            </div>

            {/* Brands Carousel */}
            <div className="border-y border-gray-100 py-6 overflow-hidden bg-gray-50/50">
                <div 
                    className="relative flex overflow-hidden w-full group" 
                    style={{ 
                        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", 
                        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" 
                    }}
                >
                    <div className="flex gap-16 animate-scroll min-w-full shrink-0 items-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500 pr-16">
                        {[...BRANDS, ...BRANDS].map((brand, i) => (
                            <span key={`1-${i}`} className="text-xl font-medium tracking-tight text-black whitespace-nowrap">{brand}</span>
                        ))}
                    </div>
                    <div className="flex gap-16 animate-scroll min-w-full shrink-0 items-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500 pr-16" aria-hidden="true">
                        {[...BRANDS, ...BRANDS].map((brand, i) => (
                            <span key={`2-${i}`} className="text-xl font-medium tracking-tight text-black whitespace-nowrap">{brand}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Por que marcas precisam de branding? */}
            <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-gray-50/50 relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black mb-6">
                            Por que marcas de comida precisam de <span className="text-brand font-bold italic pr-2">branding?</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-500 font-light leading-relaxed">
                            O cliente come primeiro com os olhos. Se a sua embalagem parece amadora, seu preço será questionado. Mas quando sua marca transmite profissionalismo, experiência e desejo, o cliente percebe valor antes mesmo da primeira mordida.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Ingredientes do Sucesso */}
            <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/30">
                {/* Decorative background grid pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#15cb98_1px,transparent_1px)] [background-size:24px_24px]" />
                
                <Container className="relative z-10">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wide uppercase mb-4">
                            Metodologia Vink
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-4">
                            Ingredientes do <span className="text-brand font-bold italic pr-2">Sucesso</span>
                        </h2>
                        <p className="text-gray-500 font-light text-base md:text-lg">
                            Tudo que sua marca precisa pra parar de parecer "só mais um restaurante" e se destacar como líder de mercado.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* 1. Logo & Identidade (Large, 7 cols) */}
                        <div className="group relative lg:col-span-7 bg-white hover:bg-gradient-to-br hover:from-brand/[0.02] hover:to-white border border-gray-150/70 hover:border-brand/20 rounded-3xl p-8 md:p-10 transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-brand/5 flex flex-col justify-between overflow-hidden min-h-[460px]">
                            {/* Ambient Light effect on hover */}
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-500">
                                        <Star className="w-5 h-5 fill-brand/20" />
                                    </div>
                                    <span className="text-[48px] font-extrabold font-mono tracking-tight text-gray-100/80 group-hover:text-brand/10 transition-colors duration-500 select-none leading-none">
                                        01
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4 group-hover:text-brand transition-colors duration-300">
                                    Logo & Identidade
                                </h3>
                                <p className="text-gray-500 font-light leading-relaxed max-w-md text-sm md:text-base">
                                    Criamos uma identidade visual alinhada com a proposta do seu negócio, garantindo que sua marca seja reconhecida instantaneamente. A base da sua presença no mercado. Não entregamos apenas um desenho; entregamos um ecossistema visual completo.
                                </p>
                            </div>
                            
                            {/* Staggered mockup visual */}
                            <div className="relative mt-8 lg:mt-0 lg:absolute lg:right-8 lg:bottom-8 lg:w-[280px] lg:h-[200px] xl:w-[320px] xl:h-[220px] rounded-2xl overflow-hidden border border-gray-150/60 shadow-lg group-hover:scale-[1.03] group-hover:-translate-y-2 group-hover:rotate-1 transition-all duration-700 ease-out bg-[#c39b74] shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Logo & Identidade" 
                                    className="w-full h-full object-cover mix-blend-overlay opacity-80" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* 2. Cardápios Estratégicos (Medium, 5 cols) */}
                        <div className="group relative lg:col-span-5 bg-white hover:bg-gradient-to-br hover:from-brand/[0.02] hover:to-white border border-gray-150/70 hover:border-brand/20 rounded-3xl p-8 md:p-10 transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-brand/5 flex flex-col justify-between overflow-hidden min-h-[460px]">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-500">
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    <span className="text-[48px] font-extrabold font-mono tracking-tight text-gray-100/80 group-hover:text-brand/10 transition-colors duration-500 select-none leading-none">
                                        02
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4 group-hover:text-brand transition-colors duration-300">
                                    Cardápios Estratégicos
                                </h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                                    O cardápio é sua principal ferramenta de vendas. Aplicamos estratégia e design para destacar os itens mais lucrativos e tornar a experiência do cliente mais intuitiva e irresistível.
                                </p>
                            </div>
                            
                            <div className="relative mt-8 h-[160px] lg:h-[180px] rounded-2xl overflow-hidden border border-gray-150/60 shadow-lg group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-700 ease-out bg-[#234b3c] shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Cardápios Estratégicos" 
                                    className="w-full h-full object-cover mix-blend-overlay opacity-60" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* 3. O conceito de Viral Packing (Medium, 5 cols) */}
                        <div className="group relative lg:col-span-5 bg-white hover:bg-gradient-to-br hover:from-brand/[0.02] hover:to-white border border-gray-150/70 hover:border-brand/20 rounded-3xl p-8 md:p-10 transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-brand/5 flex flex-col justify-between overflow-hidden min-h-[460px]">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-[48px] font-extrabold font-mono tracking-tight text-gray-100/80 group-hover:text-brand/10 transition-colors duration-500 select-none leading-none">
                                        03
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4 group-hover:text-brand transition-colors duration-300">
                                    O conceito de Viral Packing
                                </h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                                    Na era do Tiktok e Instagram, embalagem bonita vira story e divulgação grátis. A ideia do Viral Packing é criar experiências que fazem o cliente querer mostrar sua marca na internet.
                                </p>
                            </div>
                            
                            <div className="relative mt-8 h-[160px] lg:h-[180px] rounded-2xl overflow-hidden border border-gray-150/60 shadow-lg group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-700 ease-out bg-gray-100 shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1628102491629-77858ab216b2?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Viral Packing" 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* 4. Embalagens "Instagramáveis" (Large, 7 cols) */}
                        <div className="group relative lg:col-span-7 bg-white hover:bg-gradient-to-br hover:from-brand/[0.02] hover:to-white border border-gray-150/70 hover:border-brand/20 rounded-3xl p-8 md:p-10 transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-brand/5 flex flex-col justify-between overflow-hidden min-h-[460px]">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-500">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <span className="text-[48px] font-extrabold font-mono tracking-tight text-gray-100/80 group-hover:text-brand/10 transition-colors duration-500 select-none leading-none">
                                        04
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4 group-hover:text-brand transition-colors duration-300">
                                    Embalagens "Instagramáveis"
                                </h3>
                                <p className="text-gray-500 font-light leading-relaxed max-w-md text-sm md:text-base">
                                    Cada entrega será uma oportunidade de marketing. As embalagens vão fazer cada entrega parecer especial, conectando o cliente com a essência da sua marca e elevando o valor percebido.
                                </p>
                            </div>
                            
                            <div className="relative mt-8 lg:mt-0 lg:absolute lg:right-8 lg:bottom-8 lg:w-[280px] lg:h-[200px] xl:w-[320px] xl:h-[220px] rounded-2xl overflow-hidden border border-gray-150/60 shadow-lg group-hover:scale-[1.03] group-hover:-translate-y-2 group-hover:-rotate-1 transition-all duration-700 ease-out bg-[#e6e6e6] shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1606132717833-2eb59b5832a8?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Embalagens" 
                                    className="w-full h-full object-cover mix-blend-multiply" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-12 md:py-24 relative overflow-visible z-10">
                <Container className="relative z-10">
                    <div className="flex flex-col items-center text-center mb-16 gap-4">
                        <div>
                            <h2 className="text-4xl font-medium tracking-tight text-black mb-3">
                                Cases de <span className="text-brand font-bold italic pr-2">Sucesso</span>
                            </h2>
                            <p className="text-gray-500 font-light">Marcas que transformamos recentemente.</p>
                        </div>
                        <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-black hover:text-brand transition-colors">
                            Ver portfólio <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <StickyScroll cases={portfolioCases} />
                </Container>
            </section>

            {/* A Diferença é Visível */}
            <section className="py-12 md:py-24 bg-gray-50/50 border-t border-b border-gray-100 relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-3">
                            A Diferença é <span className="text-brand font-bold italic pr-2">Visível</span>
                        </h2>
                        <p className="text-gray-500 font-light text-base md:text-lg">
                            Arraste o controle deslizante para comparar o design de uma marca genérica com uma marca premium assinada pela Vink.
                        </p>
                    </div>

                    <div className="mb-16">
                        <ImageComparison
                            beforeImage="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop"
                            afterImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                            altBefore="Identidade Visual Genérica"
                            altAfter="Branding Premium Estratégico"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Antes */}
                        <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col relative">
                            <div className="inline-block self-start mb-4 bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                AMADOR
                            </div>
                            <h4 className="text-xl font-semibold text-black mb-3">Identidade Genérica</h4>
                            <ul className="text-sm text-gray-500 font-light mb-6 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">✕</span> Cardápio amador e confuso
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">✕</span> Embalagem genérica sem personalidade
                                </li>
                            </ul>
                            <p className="text-gray-500 font-light text-sm italic border-t border-gray-150 pt-6 mt-auto">
                                "Parece só mais um restaurante de bairro. O cliente escolhe pelo preço mais baixo."
                            </p>
                        </div>

                        {/* Depois */}
                        <div className="p-8 border border-brand/20 rounded-2xl bg-brand/5 shadow-sm flex flex-col relative">
                            <div className="inline-block self-start mb-4 bg-brand/20 text-brand-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                PREMIUM
                            </div>
                            <h4 className="text-xl font-semibold text-brand-dark mb-3">Branding Estratégico</h4>
                            <ul className="text-sm text-gray-600 font-light mb-6 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-brand font-bold">✓</span> Identidade visual única e memorável
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-brand font-bold">✓</span> Embalagens instagramáveis que encantam
                                </li>
                            </ul>
                            <p className="text-gray-600 font-light text-sm italic border-t border-brand/20 pt-6 mt-auto">
                                "Autoridade imediata. O cliente posta nos stories antes mesmo de provar. Valor percebido lá no alto."
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Pricing Section */}
            <VinkPlansSection />

            {/* FAQ */}
            <section className="py-12 md:py-20 bg-gray-50/50 border-t border-gray-100 relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-12 text-center">
                            Perguntas <span className="text-brand font-bold italic pr-2">Frequentes</span>
                        </h2>
                        <BrandingFaq items={FAQ_ITEMS} />
                    </div>
                </Container>
            </section>
        </div>
    );
}
