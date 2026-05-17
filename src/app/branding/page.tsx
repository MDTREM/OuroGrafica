import { Container } from "@/components/ui/Container";
import { Check, Star, Utensils, TrendingUp, Camera, Leaf, ArrowRight, ArrowUpRight, Store } from "lucide-react";
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
            <section className="pt-12 pb-4 md:pt-20 md:pb-8 relative overflow-hidden">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.05] mb-6 text-black">
                                Identidade visual que <span className="text-brand font-bold italic">DEVORA</span> a concorrência.
                            </h1>
                            
                            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg leading-relaxed font-light">
                                Criamos identidades visuais, embalagens e materiais que geram desejo e fazem seu restaurante parecer uma grande franquia desde o primeiro olhar.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <a href="#planos" className="bg-brand text-white rounded-xl px-8 py-4 font-medium hover:bg-brand-dark transition-colors flex items-center justify-center">
                                    Ver planos
                                </a>
                                <a href="https://wa.me/5531989880161?text=Olá,%20gostaria%20de%20falar%20sobre%20o%20branding%20do%20meu%20restaurante!" target="_blank" rel="noopener noreferrer" className="bg-white text-brand border border-brand rounded-xl px-8 py-4 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                                    Falar com especialista
                                </a>
                            </div>
                        </div>

                        {/* Hero Image & Badges */}
                        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[4/3] max-w-lg mx-auto bg-[#2b4c3e] rounded-xl overflow-visible mt-8 lg:mt-0">
                            <img src="https://images.unsplash.com/photo-1600850056064-a8b380df8395?q=80&w=1000&auto=format&fit=crop" alt="Branding & Embalagens" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 rounded-xl" />
                            
                            {/* Floating Badges */}
                            <div className="absolute top-8 md:top-12 -left-6 md:-left-12 bg-white text-gray-800 border border-gray-100 rounded-xl px-4 py-3 font-medium text-xs md:text-sm shadow-xl flex items-center gap-2 transform -rotate-3 z-10 whitespace-nowrap">
                                <Star size={16} className="text-brand" fill="currentColor" /> Branding & Experiência Visual
                            </div>
                            
                            <div className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 bg-gray-100 text-gray-800 border border-gray-200 rounded-xl px-4 py-3 font-medium text-xs md:text-sm shadow-xl flex items-center gap-2 transform rotate-2 z-10 whitespace-nowrap">
                                <Store size={16} className="text-brand" /> Especialistas em Delivery Experience
                            </div>

                            <div className="absolute bottom-8 md:bottom-12 -left-4 md:-left-8 bg-[#1a1a1a] text-white rounded-xl px-4 py-3 font-medium text-xs md:text-sm shadow-xl flex items-center gap-2 transform -rotate-1 z-10 whitespace-nowrap">
                                <Leaf size={16} className="text-brand" /> Embalagens que Geram Desejo
                            </div>
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
            <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-gray-50/50">
                <Container>
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
            <section className="py-12 md:py-24">
                <Container>
                    <div className="text-center mb-24 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-4">
                            Ingredientes do <span className="text-brand font-bold italic pr-2">Sucesso</span>
                        </h2>
                        <p className="text-gray-500 font-light">
                            Tudo que sua marca precisa pra parar de parecer "só mais um restaurante".
                        </p>
                    </div>

                    <div className="space-y-16 md:space-y-28">
                        {/* 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                            <div className="md:col-span-5 aspect-[4/3] bg-[#c39b74] rounded-xl overflow-hidden shadow-sm w-full max-w-sm mx-auto">
                                <img src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop" alt="Logo & Identidade" className="w-full h-full object-cover mix-blend-overlay opacity-80" />
                            </div>
                            <div className="md:col-span-7 md:pl-10">
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4">Logo & Identidade</h3>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Criamos uma identidade visual alinhada com a proposta do seu negócio, garantindo que sua marca seja reconhecida instantaneamente. A base da sua presença no mercado. Não entregamos apenas um desenho; entregamos um ecossistema visual completo.
                                </p>
                            </div>
                        </div>

                        {/* 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                            <div className="order-2 md:order-1 md:col-span-7 md:pr-10">
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4">Cardápios Estratégicos</h3>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    O cardápio é sua principal ferramenta de vendas. Aplicamos estratégia e design para destacar os itens mais lucrativos e tornar a experiência do cliente mais intuitiva e irresistível.
                                </p>
                            </div>
                            <div className="order-1 md:order-2 md:col-span-5 aspect-[4/3] bg-[#234b3c] rounded-xl overflow-hidden shadow-sm w-full max-w-sm mx-auto">
                                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop" alt="Cardápios Estratégicos" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                            </div>
                        </div>

                        {/* 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                            <div className="md:col-span-5 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow-sm w-full max-w-sm mx-auto">
                                <img src="https://images.unsplash.com/photo-1628102491629-77858ab216b2?q=80&w=1000&auto=format&fit=crop" alt="Viral Packing" className="w-full h-full object-cover" />
                            </div>
                            <div className="md:col-span-7 md:pl-10">
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4">O conceito de Viral Packing</h3>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Na era do Tiktok e Instagram, embalagem bonita vira story e divulgação grátis. A ideia do Viral Packing é criar experiências que fazem o cliente querer mostrar sua marca na internet.
                                </p>
                            </div>
                        </div>

                        {/* 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                            <div className="order-2 md:order-1 md:col-span-7 md:pr-10">
                                <h3 className="text-2xl md:text-3xl font-medium text-black mb-4">Embalagens "Instagramáveis"</h3>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Cada entrega será uma oportunidade de marketing. As embalagens vão fazer cada entrega parecer especial, conectando o cliente com a essência da sua marca e elevando o valor percebido.
                                </p>
                            </div>
                            <div className="order-1 md:order-2 md:col-span-5 aspect-[4/3] bg-[#e6e6e6] rounded-xl overflow-hidden shadow-sm w-full max-w-sm mx-auto">
                                <img src="https://images.unsplash.com/photo-1606132717833-2eb59b5832a8?q=80&w=1000&auto=format&fit=crop" alt="Embalagens" className="w-full h-full object-cover mix-blend-multiply" />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Portfolio Section */}
            <section className="py-12 md:py-24">
                <Container>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {portfolioCases.length > 0 ? portfolioCases.map(item => (
                            <Link href={`/portfolio/${item.slug}`} key={item.id} className="group cursor-pointer">
                                <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-4 relative rounded-xl">
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

            {/* A Diferença é Visível */}
            <section className="py-12 md:py-20 bg-gray-50/50 border-t border-gray-100">
                <Container>
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-3">
                            A Diferença é <span className="text-brand font-bold italic pr-2">Visível</span>
                        </h2>
                        <p className="text-gray-500 font-light">
                            Do amador ao irresistível em 45 dias.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white w-full shadow-sm">
                        {/* Antes */}
                        <div className="p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col relative">
                            <div className="absolute top-6 left-6 bg-[#b22a2a] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                                AMADOR
                            </div>
                            <div className="aspect-[16/9] bg-gray-200 rounded-xl overflow-hidden mb-8 mt-4 grayscale">
                                <img src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop" alt="Amador" className="w-full h-full object-cover opacity-70" />
                            </div>
                            <h4 className="text-xl font-medium text-black mb-3">Identidade Genérica</h4>
                            <ul className="text-sm text-gray-500 font-light mb-6 space-y-2">
                                <li>• Cardápio amador</li>
                                <li>• Embalagem genérica</li>
                            </ul>
                            <p className="text-gray-500 font-light text-sm italic border-t border-gray-100 pt-6 mt-auto">
                                "Parece só mais um restaurante de bairro. O cliente escolhe pelo preço mais baixo."
                            </p>
                        </div>

                        {/* Depois */}
                        <div className="p-10 flex flex-col relative bg-brand/5">
                            <div className="absolute top-6 left-6 bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                                PREMIUM
                            </div>
                            <div className="aspect-[16/9] bg-brand/20 rounded-xl overflow-hidden mb-8 mt-4">
                                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop" alt="Premium" className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-xl font-medium text-brand mb-3">Branding Estratégico</h4>
                            <ul className="text-sm text-gray-600 font-light mb-6 space-y-2">
                                <li>• Identidade forte</li>
                                <li>• Embalagem instagramável</li>
                            </ul>
                            <p className="text-gray-600 font-light text-sm italic border-t border-brand/20 pt-6 mt-auto">
                                "Autoridade imediata. O cliente posta nos stories antes mesmo de provar. Valor percebido lá no alto."
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Pricing Section */}
            <section id="planos" className="py-12 md:py-24 bg-white text-gray-900 border-t border-gray-100">
                <Container>
                    <div className="max-w-2xl mb-20 text-center mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight mb-4 text-black">
                            Planos <span className="text-brand font-bold italic pr-2">sob medida.</span>
                        </h2>
                        <p className="text-gray-500 font-light">Escolha o tamanho do seu apetite por crescimento.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                        
                        {/* Plan 1 */}
                        <div className="p-8 border border-gray-100 flex flex-col bg-gray-50/50 rounded-xl relative group">
                            <h3 className="text-xl font-medium mb-2 text-black">Basic Taste</h3>
                            <p className="text-gray-500 text-sm font-light mb-8 h-10">O essencial para começar com o pé direito.</p>
                            
                            <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Logo principal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Versões da Logo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Paleta de cores</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Tipografia</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Manual básico</span>
                                </li>
                            </ul>

                             <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Basic%20Taste!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 border border-gray-200 text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:border-black transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                        {/* Plan 2 */}
                        <div className="p-8 border-2 border-brand flex flex-col relative bg-white rounded-xl shadow-lg -translate-y-2 z-10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                                Mais Escolhido
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-black">Combo Perfeito</h3>
                            <p className="text-gray-500 text-sm font-light mb-8 h-10">Branding completo + impressos.</p>
                            
                            <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span className="text-black font-semibold">Tudo do Basic Taste</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Cardápio</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Cartões de Visita</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Panfletos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Adesivos e Lacres</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Manual de Marca</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Posicionamento e Tom de voz</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Combo%20Perfeito!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-brand text-white text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:bg-brand-dark transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                        {/* Plan 3 */}
                        <div className="p-8 border border-gray-200 flex flex-col bg-white rounded-xl relative group hover:border-black transition-colors">
                            <h3 className="text-xl font-medium mb-2 text-black">Banquete Viral</h3>
                            <p className="text-gray-500 text-sm font-light mb-8 h-10">O pacote definitivo para dominar sua região.</p>
                            
                            <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span className="text-black font-semibold">Tudo do Combo Perfeito</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Embalagens</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Sacolas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Uniformes e Crachás</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Fachada</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Design de Frota</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Estratégia de Unboxing Experience</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20plano%20Banquete%20Viral!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 border border-gray-200 text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl group-hover:border-black transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>

                        {/* Plan 4 */}
                        <div className="p-8 border border-[#333] flex flex-col bg-[#141414] rounded-xl relative">
                            <h3 className="text-xl font-medium mb-2 text-white">Vink Club</h3>
                            <p className="text-gray-400 text-sm font-light mb-8 h-10">Padronização e recorrência de materiais.</p>
                            
                            <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span className="text-white font-semibold">Tudo do Combo Perfeito</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Envio Mensal de Impressos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Gestão de Ativos de Marca</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Consultoria de Expansão</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand text-xs mt-1">✦</span>
                                    <span>Suporte Prioritário</span>
                                </li>
                            </ul>

                            <a href="https://wa.me/5531989880161?text=Olá,%20quero%20saber%20mais%20sobre%20o%20Vink%20Club!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-white text-black text-xs tracking-wide uppercase font-medium text-center rounded-xl hover:bg-gray-200 transition-colors">
                                Solicitar Orçamento
                            </a>
                        </div>
                    </div>
                </Container>
            </section>

            {/* FAQ */}
            <section className="py-12 md:py-20 bg-gray-50/50 border-t border-gray-100">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-medium tracking-tight text-black mb-12 text-center">
                            Perguntas <span className="text-brand font-bold italic pr-2">Frequentes</span>
                        </h2>
                        <div className="space-y-4">
                            <details className="group border border-gray-200 bg-white rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-black">
                                    <h4 className="text-lg">Quanto tempo leva para criar uma marca completa?</h4>
                                    <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </span>
                                </summary>
                                <p className="mt-4 text-gray-500 font-light leading-relaxed pr-8">
                                    O processo estratégico de branding leva em média de 30 a 45 dias, dependendo da complexidade dos materiais físicos e rodadas de aprovação.
                                </p>
                            </details>

                            <details className="group border border-gray-200 bg-white rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-black">
                                    <h4 className="text-lg">Vocês também fabricam as embalagens?</h4>
                                    <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </span>
                                </summary>
                                <p className="mt-4 text-gray-500 font-light leading-relaxed pr-8">
                                    Sim! Temos uma rede de parceiros industriais homologados para garantir que o design do papel saia exatamente como o projeto digital, com preços competitivos de fábrica.
                                </p>
                            </details>

                            <details className="group border border-gray-200 bg-white rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-black">
                                    <h4 className="text-lg">Eu já tenho uma logo. Posso fazer só as embalagens?</h4>
                                    <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </span>
                                </summary>
                                <p className="mt-4 text-gray-500 font-light leading-relaxed pr-8">
                                    Podemos realizar o redesign ou a aplicação de marca em novos suportes, desde que a marca atual comporte um padrão de qualidade VINK. Caso contrário, sugerimos um ajuste técnico.
                                </p>
                            </details>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}
