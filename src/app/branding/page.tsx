import { Container } from "@/components/ui/Container";
import { Check, Star, Utensils, TrendingUp, Camera, Leaf, ArrowRight, ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { getCases } from "@/actions/portfolio-actions";
import Link from "next/link";

export const metadata = {
    title: "Vink | Branding para Gastronomia",
    description: "Identidade visual que devora a concorrência. Transformamos restaurantes, hamburguerias e deliveries em marcas inesquecíveis.",
};

const BRANDS = [
    "Burger King", "Outback", "Domino's", "Bacio di Latte", "KFC", "Subway", "Madero", "Coco Bambu"
];

export default async function BrandingPage() {
    const portfolioCases = await getCases(4);

    return (
        <div className="bg-white min-h-screen text-gray-900 selection:bg-brand selection:text-white">
            {/* Hero Section */}
            <section className="pt-32 pb-24 md:pt-40 md:pb-32 relative">
                <Container>
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-gray-200">
                            <span className="w-1.5 h-1.5 bg-brand"></span>
                            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">Especialistas em Food Service</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-medium tracking-tight leading-[1.05] mb-8 text-black">
                            Identidade visual que <br className="hidden md:block" />
                            <span className="text-brand font-bold italic pr-2">DEVORA</span> a concorrência.
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl leading-relaxed font-light">
                            Transformamos restaurantes, hamburguerias e deliveries em marcas inesquecíveis. Design tátil, embalagens virais e uma experiência que dá fome.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <a href="#planos" className="bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                Ver Planos
                                <ArrowRight size={18} />
                            </a>
                            <a href="https://wa.me/5531989880161?text=Olá,%20gostaria%20de%20falar%20sobre%20o%20branding%20do%20meu%20restaurante!" target="_blank" rel="noopener noreferrer" className="bg-white text-black border border-gray-200 px-8 py-4 font-medium hover:border-gray-900 transition-colors flex items-center justify-center">
                                Falar com Especialista
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-32 pt-12 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
                        <div>
                            <p className="text-4xl font-light text-black mb-2">
                                <CountUp end={200} prefix="+" />
                            </p>
                            <p className="text-xs font-medium tracking-widest uppercase text-gray-400">Marcas Atendidas</p>
                        </div>
                        <div>
                            <p className="text-4xl font-light text-black mb-2">
                                <CountUp end={98} suffix="%" />
                            </p>
                            <p className="text-xs font-medium tracking-widest uppercase text-gray-400">de Satisfação</p>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-4xl font-light text-black mb-2">
                                <CountUp end={100} suffix="%" />
                            </p>
                            <p className="text-xs font-medium tracking-widest uppercase text-gray-400">Foco em Gastronomia</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Brands Carousel */}
            <div className="border-y border-gray-100 py-12 overflow-hidden bg-gray-50/50">
                <Container>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">Marcas que confiam na Vink</p>
                </Container>

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

            {/* Pillars Section */}
            <section className="py-32">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                        <div className="md:col-span-4">
                            <h2 className="text-3xl md:text-4xl font-medium text-black leading-tight mb-4">O que fazemos<br />pela sua marca.</h2>
                            <p className="text-gray-500 font-light leading-relaxed">
                                Abordagem estratégica completa para destacar o seu negócio no mercado gastronômico.
                            </p>
                        </div>

                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div>
                                <Utensils size={24} strokeWidth={1.5} className="text-brand mb-6" />
                                <h3 className="text-lg font-medium text-black mb-3">Criação de Logo & Identidade</h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm">
                                    Cores, tipografia e logo que transmitem o sabor e a essência da sua cozinha antes mesmo do cliente provar.
                                </p>
                            </div>
                            <div>
                                <TrendingUp size={24} strokeWidth={1.5} className="text-brand mb-6" />
                                <h3 className="text-lg font-medium text-black mb-3">Design de Cardápios</h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm">
                                    Engenharia de cardápio aplicada ao design para otimizar vendas e destacar seus pratos mais lucrativos.
                                </p>
                            </div>
                            <div>
                                <Leaf size={24} strokeWidth={1.5} className="text-brand mb-6" />
                                <h3 className="text-lg font-medium text-black mb-3">Estratégia de Embalagens</h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm">
                                    Embalagens que protegem o alimento, encantam o cliente e divulgam sua marca pelas ruas da cidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Viral Packing Concept */}
            <section className="py-32 bg-[#fcfcfc] border-y border-gray-100">
                <Container>
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-8">
                            O conceito de <span className="text-brand font-bold italic pr-2">Viral Packing</span>
                        </h2>
                        <p className="text-xl md:text-2xl font-light text-gray-500 leading-relaxed italic">
                            "Na era do Tiktok e do Instagram, a experiência não termina quando a comida chega. Uma embalagem extraordinária transforma cada cliente em um micro-influenciador da sua marca."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative group">
                            <img src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop" alt="Embalagem Viral" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="space-y-16 pl-0 md:pl-8">
                            <div>
                                <h4 className="text-2xl font-medium text-black mb-4 flex items-center gap-3">
                                    <Camera size={24} strokeWidth={1.5} className="text-gray-400" />
                                    Design "Instagramável"
                                </h4>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Criamos unboxings memoráveis que geram vontade imediata de tirar uma foto e compartilhar com os amigos.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-2xl font-medium text-black mb-4 flex items-center gap-3">
                                    <Leaf size={24} strokeWidth={1.5} className="text-gray-400" />
                                    Sustentabilidade Inteligente
                                </h4>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Seleção de materiais eco-friendly que preservam a temperatura e integridade do prato, sem abrir mão do apelo visual.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Portfolio Section */}
            <section className="py-32">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {portfolioCases.length > 0 ? portfolioCases.map(item => (
                            <Link href={`/portfolio/${item.slug}`} key={item.id} className="group cursor-pointer">
                                <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-4 relative">
                                    {item.cover_image ? (
                                        <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">Sem Imagem</div>
                                    )}
                                </div>
                                <h4 className="font-medium text-black text-lg group-hover:text-brand transition-colors">{item.title}</h4>
                                <p className="text-gray-500 text-sm font-light mt-1">{item.category}</p>
                            </Link>
                        )) : (
                            <div className="col-span-full py-12 text-center text-gray-400 font-light border border-dashed border-gray-200">
                                Nenhum case publicado ainda.
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Pricing Section */}
            <section id="planos" className="py-32 bg-black text-white">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl font-medium tracking-tight mb-4">
                            Planos <span className="text-brand font-bold italic pr-2">sob medida.</span>
                        </h2>
                        <p className="text-gray-400 font-light">Escolha a solução ideal para o apetite do seu negócio.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-5xl mx-auto border border-white/10">
                        
                        {/* Plan 1 */}
                        <div className="p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col hover:bg-white/5 transition-colors">
                            <h3 className="text-xl font-medium mb-2">Basic Taste</h3>
                            <p className="text-gray-400 text-sm font-light mb-10 h-10">O essencial para começar com o pé direito.</p>
                            
                            <ul className="space-y-5 mb-12 flex-1 text-sm font-light text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Naming (Criação do Nome)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Logo e Variações</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Paleta de Cores e Tipografia</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Manual da Marca Básico</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Basic%20Taste!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 border border-white/20 hover:border-white text-white text-sm tracking-wide uppercase font-medium text-center transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                        {/* Plan 2 */}
                        <div className="p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-white/5 relative">
                            <div className="absolute top-0 right-0 bg-brand text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                Mais Escolhido
                            </div>
                            <h3 className="text-xl font-medium mb-2">Combo Perfeito</h3>
                            <p className="text-gray-400 text-sm font-light mb-10 h-10">Branding completo mais os impressos vitais.</p>
                            
                            <ul className="space-y-5 mb-12 flex-1 text-sm font-light text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span className="text-white font-medium">Tudo do Basic Taste</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Cardápio (Físico/Digital)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Cartões de Visita</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Panfletos / Encartes</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Combo%20Perfeito!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-brand hover:bg-brand-dark text-black text-sm tracking-wide uppercase font-medium text-center transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                        {/* Plan 3 */}
                        <div className="p-10 flex flex-col hover:bg-white/5 transition-colors">
                            <h3 className="text-xl font-medium mb-2">Banquete Viral</h3>
                            <p className="text-gray-400 text-sm font-light mb-10 h-10">O pacote definitivo para dominar sua região.</p>
                            
                            <ul className="space-y-5 mb-12 flex-1 text-sm font-light text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span className="text-white font-medium">Tudo do Combo Perfeito</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Embalagens Primárias</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Adesivos e Lacres</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Estratégia de Unboxing Experience</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Banquete%20Viral!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 border border-white/20 hover:border-white text-white text-sm tracking-wide uppercase font-medium text-center transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                    </div>
                </Container>
            </section>
        </div>
    );
}
