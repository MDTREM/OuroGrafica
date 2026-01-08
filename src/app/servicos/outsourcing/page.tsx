'use client';

import { Container } from "@/components/ui/Container";
import { CheckCircle, MapPin, Send, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { HeroCarousel } from "@/components/ui/HeroCarousel";

import { Banner } from "@/actions/homepage-actions";

export default function OutsourcingPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [banners, setBanners] = useState<Banner[]>([{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop' }]);

    useEffect(() => {
        import('@/actions/homepage-actions').then(async ({ getPagesConfig }) => {
            const config = await getPagesConfig();
            if (config.outsourcingBanners && config.outsourcingBanners.length > 0) {
                setBanners(config.outsourcingBanners);
            }
        });
    }, []);

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
            title: "Atualização tecnológica",
            text: "Conte com equipamentos atualizados e garanta os melhores resultados, sem a necessidade de um novo investimento.",
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

    const locations = [
        { name: "Ouro Preto", x: "53%", y: "63%" },
        { name: "Mariana", x: "60%", y: "61%" },
        { name: "Itabirito", x: "46%", y: "54%" },
        { name: "Ouro Branco", x: "49%", y: "72%" },
        { name: "Ponte Nova", x: "70%", y: "62%" },
        { name: "Cachoeira do Campo", x: "46%", y: "61%" }
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormStatus('sending');

        const formData = new FormData(e.currentTarget);
        const data = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            company_name: formData.get('company_name') as string,
            cnpj: formData.get('cnpj') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            equipment_qty: formData.get('equipment_qty') as string,
            print_volume: formData.get('print_volume') as string,
            area_of_operation: formData.get('area_of_operation') as string,
            message: formData.get('message') as string,
        };

        const { submitQuoteRequest } = await import('@/actions/quote-actions');
        const res = await submitQuoteRequest(data);

        if (res.success) {
            setFormStatus('sent');
        } else {
            setFormStatus('idle'); // Handle error ideally
            alert('Erro ao enviar. Tente novamente.');
        }
    }

    const [activeCity, setActiveCity] = useState<number | null>(null);

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-6">
            {/* Banner Section */}
            <Container>
                <div className="relative h-[200px] md:h-[300px] bg-black overflow-hidden group shadow-lg rounded-lg">
                    <HeroCarousel banners={banners} />
                </div>
            </Container>

            {/* Brands Carousel (Infinite Scroll) */}
            <div className="py-10 overflow-hidden bg-white">
                <style jsx>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        animation: scroll 10s linear infinite;
                    }
                `}</style>
                <Container>
                    <div className="flex items-center gap-4 mb-6 justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Trabalhamos com as Melhores Marcas</h3>
                    </div>

                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        <div className="flex animate-scroll whitespace-nowrap gap-16 items-center">
                            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale opacity-100 transition-all duration-300">
                                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
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
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
                    <div className="w-full text-left">
                        <h2 className="text-2xl font-bold text-gray-900">Veja onde atuamos</h2>
                        <p className="text-gray-500 mt-2">Clique nos pinos no mapa para ver as cidades atendidas.</p>
                    </div>

                    <div className="relative w-full max-w-3xl mx-auto aspect-square flex items-center justify-center rounded-2xl overflow-hidden">
                        {/* Map Image */}
                        <div className="relative w-full h-full">
                            <img
                                src="https://media.istockphoto.com/id/944066468/pt/vetorial/map-of-minas-gerais.jpg?s=612x612&w=0&k=20&c=5CYTQFo_QMsd-Xfd_67SFvrzigUABYnYGWnViXTVbfw="
                                alt="Mapa de Minas Gerais"
                                className="w-full h-full object-contain opacity-20 mix-blend-multiply grayscale hover:grayscale-0 transition-all duration-700"
                            />

                            {/* Pins Overlay - Adjusted roughly to clustered region in MG */}
                            {locations.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCity(activeCity === idx ? null : idx)}
                                    className="absolute flex flex-col items-center group cursor-pointer z-10 transition-transform active:scale-95 outline-none"
                                    style={{ left: loc.x, top: loc.y }}
                                >
                                    <MapPin
                                        className={`w-8 h-8 fill-current drop-shadow-md transition-all duration-300 ${activeCity === idx ? 'text-[#FF6B07] scale-125' : 'text-orange-400/80 hover:text-[#FF6B07] hover:scale-110'}`}
                                    />

                                    {/* Tooltip / Label */}
                                    <div className={`absolute bottom-full mb-3 bg-white text-gray-900 px-4 py-2 rounded-xl shadow-xl font-bold text-sm whitespace-nowrap transition-all duration-300 border border-gray-100 z-20 ${activeCity === idx ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-2 scale-95 pointer-events-none'}`}>
                                        {loc.name}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Equipamentos */}
                <div className="space-y-12">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900">Conheça nossos Equipamentos</h2>
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
                <div className="py-8 bg-gray-50/50 -mx-4 md:-mx-8 lg:-mx-16 px-4 md:px-8 lg:px-16" id="contato">
                    <Container>
                        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-[#FF6B07] text-white rounded-lg flex items-center justify-center">
                                        <Printer size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Solicitar Proposta</h2>
                                </div>

                                {formStatus === 'sent' ? (
                                    <div className="text-center py-12 space-y-6">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle className="w-10 h-10 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800">Proposta Solicitada!</h3>
                                            <p className="text-gray-600 mt-2">Nossa equipe entrará em contato em breve.</p>
                                        </div>
                                        <button onClick={() => setFormStatus('idle')} className="text-brand font-medium hover:underline">Enviar nova solicitação</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <input required name="first_name" type="text" placeholder="Seu nome" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />
                                        <input required name="last_name" type="text" placeholder="Sobrenome" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <input required name="company_name" type="text" placeholder="Empresa" className="col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />
                                            <input required name="cnpj" type="text" placeholder="CNPJ" className="col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input required name="phone" type="tel" placeholder="WhatsApp" className="col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />
                                            <input required name="email" type="email" placeholder="E-mail" className="col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <select name="equipment_qty" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all text-gray-600 appearance-none">
                                                <option value="" disabled selected>Qtd. Equipamentos</option>
                                                <option>1-5</option>
                                                <option>6-10</option>
                                                <option>11-20</option>
                                                <option>20+</option>
                                            </select>
                                            <select name="print_volume" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all text-gray-600 appearance-none">
                                                <option value="" disabled selected>Vol. Mensal</option>
                                                <option>Até 2k</option>
                                                <option>2k - 10k</option>
                                                <option>10k - 50k</option>
                                                <option>+50k</option>
                                            </select>
                                        </div>

                                        <select name="area_of_operation" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all text-gray-600 appearance-none">
                                            <option value="" disabled selected>Segmento da Empresa</option>
                                            <option>Educacional</option>
                                            <option>Saúde</option>
                                            <option>Corporativo</option>
                                            <option>Jurídico</option>
                                            <option>Gráfica</option>
                                            <option>Outro</option>
                                        </select>

                                        <textarea required name="message" rows={3} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none resize-none text-sm transition-all" placeholder="Como podemos ajudar? Detalhes adicionais..."></textarea>

                                        <button
                                            type="submit"
                                            disabled={formStatus === 'sending'}
                                            className="w-full bg-[#FF6B07] text-white font-bold h-12 rounded-xl hover:bg-[#e65a00] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200 active:scale-[0.98]"
                                        >
                                            {formStatus === 'sending' ? (
                                                <>Enviando...</>
                                            ) : (
                                                <>
                                                    Enviar Pedido
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}

                                <div className="relative my-6 text-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <span className="relative bg-white px-2 text-xs text-gray-400 font-medium uppercase">OU FALE AGORA</span>
                                </div>

                                <a
                                    href="https://wa.me/5531982190935?text=Olá! Tenho interesse no serviço de Outsourcing."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#FF6B07] text-white font-bold h-12 rounded-xl hover:bg-[#e65a00] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98]"
                                >
                                    <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" aria-hidden="true">
                                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                    </svg>
                                    Orçamento Rápido no WhatsApp
                                </a>
                            </div>
                        </div>
                    </Container>
                </div>
            </Container>
        </div>
    );
}

const BRANDS = [
    { name: 'Epson', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Epson_logo.svg/2560px-Epson_logo.svg.png' },
    { name: 'Canon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canon_logo.svg/2560px-Canon_logo.svg.png' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png' },
    { name: 'Brother', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Brother_logo.svg/2560px-Brother_logo.svg.png' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg' },
    { name: 'Ricoh', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ricoh_logo_2005.svg/1280px-Ricoh_logo_2005.svg.png' },
    { name: 'Xerox', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Xerox_logo.svg/1280px-Xerox_logo.svg.png' }
];
