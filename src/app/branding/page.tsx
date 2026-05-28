import { Container } from "@/components/ui/Container";
import { Check, Star, Utensils, TrendingUp, Camera, Leaf, ArrowRight, ArrowUpRight, Store } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { getCases } from "@/actions/portfolio-actions";
import Link from "next/link";
import VinkPlansSection from "@/components/ui/VinkPlansSection";
import BrandExpansionSection from "@/components/ui/BrandExpansionSection";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import StickyScroll from "@/components/ui/sticky-scroll";
import BrandingHeroHeadline from "@/components/ui/BrandingHeroHeadline";
import { ImageComparison } from "@/components/ui/image-comparison-slider";
import { BrandingFaq } from "@/components/ui/BrandingFaq";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import { BrandingTimeline } from "@/components/ui/release-time-line";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
        answer: "Podemos realizar o redesign ou a aplicação de marca em novos suportes, desde que a marca atual comporte um padrão de qualidade VINK. Caso contrário, sugerimos um adjustment técnico."
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Side: Text Content */}
                        <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
                            <BrandingHeroHeadline />
                            
                            <ScrollReveal delay={150}>
                                <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl lg:max-w-none leading-relaxed font-light mt-4">
                                    Criamos identidades visuais, embalagens e materiais que geram desejo e fazem seu restaurante parecer uma grande franquia desde o primeiro olhar.
                                </p>
                            </ScrollReveal>
                            
                            <ScrollReveal delay={300}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
                                    <a href="#planos" className="bg-brand text-white rounded-xl px-8 py-4 font-medium transition-colors flex items-center justify-center relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]">
                                        <span className="relative z-10 flex items-center justify-center">Ver planos</span>
                                    </a>
                                    <a href="https://wa.me/5531989880161?text=Olá,%20gostaria%20de%20falar%20sobre%20o%20branding%20do%20meu%20restaurante!" target="_blank" rel="noopener noreferrer" className="bg-white text-brand border border-brand rounded-xl px-8 py-4 font-medium transition-colors flex items-center justify-center relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-gray-50">
                                        <span className="relative z-10 flex items-center justify-center">Falar com especialista</span>
                                    </a>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right Side: Interactive Image Accordion (Hidden on Mobile, Visible on Desktop) */}
                        <div className="hidden lg:flex lg:col-span-7 w-full overflow-hidden items-center justify-center">
                            <ScrollReveal delay={200} className="w-full">
                                <LandingAccordionItem />
                            </ScrollReveal>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Stats */}
            <ScrollReveal delay={400}>
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
            </ScrollReveal>

            {/* Brands Carousel */}
            <ScrollReveal>
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
            </ScrollReveal>

            {/* Por que marcas precisam de branding? */}
            <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-gray-50/50 relative overflow-hidden">
                <Container className="relative z-10">
                    <ScrollReveal>
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black mb-6">
                                Por que marcas de comida precisam de <span className="text-brand font-bold italic pr-2">branding?</span>
                            </h2>
                            <p className="text-base md:text-lg text-gray-500 font-light leading-relaxed">
                                O cliente come primeiro com os olhos. Se a sua embalagem parece amadora, seu preço será questionado. Mas quando sua marca transmite profissionalismo, experiência e desejo, o cliente percebe valor antes mesmo da primeira mordida.
                            </p>
                        </div>
                    </ScrollReveal>
                </Container>
            </section>

            {/* Ingredientes do Sucesso */}
            <section className="py-12 md:py-24 relative overflow-hidden">
                <Container className="relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-16 md:mb-20 max-w-2xl mx-auto">
                            <h2 className="text-4xl font-medium tracking-tight text-black mb-4">
                                Ingredientes do <span className="text-brand font-bold italic pr-2">Sucesso</span>
                            </h2>
                            <p className="text-gray-500 font-light">
                                Tudo que sua marca precisa pra parar de parecer &quot;só mais um restaurante&quot;.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="max-w-3xl mx-auto">
                        <BrandingTimeline />
                    </div>
                </Container>
            </section>

            <section className="py-12 md:py-24 relative overflow-visible z-10">
                <Container className="relative z-10">
                    <ScrollReveal>
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
                    </ScrollReveal>

                    <ScrollReveal delay={150}>
                        <StickyScroll cases={portfolioCases} />
                    </ScrollReveal>
                </Container>
            </section>

            {/* A Diferença é Visível */}
            <section className="py-12 md:py-24 bg-gray-50/50 border-t border-b border-gray-100 relative overflow-hidden">
                <Container className="relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-16 max-w-2xl mx-auto">
                            <h2 className="text-4xl font-medium tracking-tight text-black mb-3">
                                A Diferença é <span className="text-brand font-bold italic pr-2">Visível</span>
                            </h2>
                            <p className="text-gray-500 font-light text-base md:text-lg">
                                Arraste o controle deslizante para comparar o design de uma marca genérica com uma marca premium assinada pela Vink.
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={150}>
                        <div className="mb-16">
                            <ImageComparison
                                beforeImage="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop"
                                afterImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                                altBefore="Identidade Visual Genérica"
                                altAfter="Branding Premium Estratégico"
                            />
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Antes */}
                        <ScrollReveal delay={200} className="flex flex-col h-full">
                            <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col relative h-full">
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
                        </ScrollReveal>

                        {/* Depois */}
                        <ScrollReveal delay={300} className="flex flex-col h-full">
                            <div className="p-8 border border-brand/20 rounded-2xl bg-brand/5 shadow-sm flex flex-col relative h-full">
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
                        </ScrollReveal>
                    </div>
                </Container>
            </section>

            {/* Pricing Section */}
            <VinkPlansSection />

            {/* Brand Expansion Section */}
            <BrandExpansionSection />

            {/* FAQ */}
            <section className="py-12 md:py-20 bg-gray-50/50 border-t border-gray-100 relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <ScrollReveal>
                            <h2 className="text-4xl font-medium tracking-tight text-black mb-12 text-center">
                                Perguntas <span className="text-brand font-bold italic pr-2">Frequentes</span>
                            </h2>
                        </ScrollReveal>
                        <ScrollReveal delay={150}>
                            <BrandingFaq items={FAQ_ITEMS} />
                        </ScrollReveal>
                    </div>
                </Container>
            </section>
        </div>
    );
}
