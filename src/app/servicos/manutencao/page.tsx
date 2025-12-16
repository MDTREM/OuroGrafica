"use client";

import { Container } from "@/components/ui/Container";
import { Wrench, Printer, AlertTriangle, Send, MapPin, Wifi, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ManutencaoPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulator - In real life, send to API or direct to WhatsApp
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormStatus('sent');
    };

    return (
        <div className="bg-white pb-20 pt-6">
            {/* Banner Section - Admin Editable */}
            <Container>
                <div className="relative h-[200px] md:h-[300px] bg-black overflow-hidden group shadow-lg rounded-lg">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599589392233-01d0c950a998?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-1000"
                    />
                    {/* Text removed as requested */}
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
                        animation: scroll 15s linear infinite;
                    }
                `}</style>
                <Container>
                    <div className="flex items-center gap-4 mb-6 justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Marcas Parceiras</h3>
                    </div>

                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        <div className="flex animate-scroll whitespace-nowrap gap-16 items-center">
                            {/* Quadruple the list for seamless loop on large screens */}
                            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale opacity-100 transition-all duration-300">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Problemas Comuns</h2>

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
                    <div id="formulario" className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#FF6B07] text-white rounded-lg flex items-center justify-center">
                                    <Printer size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Pré-Orçamento Online</h2>
                            </div>

                            {formStatus === 'sent' ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Pedido Enviado!</h3>
                                    <p className="text-gray-500 text-sm mb-6">Nossa equipe analisará e entrará em contato pelo WhatsApp.</p>
                                    <button onClick={() => setFormStatus('idle')} className="text-[#FF6B07] text-sm font-bold hover:underline">
                                        Enviar novo pedido
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        required
                                        type="text"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all"
                                        placeholder="Seu Nome"
                                    />
                                    <input
                                        required
                                        type="tel"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all"
                                        placeholder="WhatsApp (com DDD)"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <select className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all appearance-none text-gray-600">
                                            <option value="" disabled selected>Marca</option>
                                            <option>Epson</option>
                                            <option>HP</option>
                                            <option>Canon</option>
                                            <option>Brother</option>
                                            <option>Samsung</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none text-sm transition-all"
                                            placeholder="Modelo (Opcional)"
                                        />
                                    </div>

                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF6B07] focus:ring-1 focus:ring-[#FF6B07] outline-none resize-none text-sm transition-all"
                                        placeholder="Descreva brevemente o problema..."
                                    />

                                    <button
                                        disabled={formStatus === 'sending'}
                                        type="submit"
                                        className="w-full bg-[#FF6B07] text-white font-bold h-12 rounded-xl hover:bg-[#e65a00] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200 active:scale-[0.98]"
                                    >
                                        {formStatus === 'sending' ? 'Enviando...' : 'Enviar Pedido'}
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
                                href="https://wa.me/5531982190935?text=Olá! Preciso de um orçamento para minha impressora."
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
        </div>
    );
}

const BRANDS = [
    { name: 'Epson', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Epson_logo.svg/2560px-Epson_logo.svg.png' },
    { name: 'Canon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canon_logo.svg/2560px-Canon_logo.svg.png' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png' },
    { name: 'Brother', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Brother_logo.svg/2560px-Brother_logo.svg.png' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg' }
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
