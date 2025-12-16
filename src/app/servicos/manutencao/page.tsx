"use client";

import { Container } from "@/components/ui/Container";
import { Wrench, CheckCircle, Smartphone, Printer, AlertTriangle, Send } from "lucide-react";
import Link from "next/link";
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
        <div className="bg-white pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <Container className="relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                            <Wrench size={16} />
                            Assistência Técnica Especializada
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Sua impressora parou? <br />
                            <span className="text-blue-200">Nós consertamos.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                            Manutenção profissional para impressoras Epson, HP, Canon e Brother em Ouro Preto e Região.
                            Recuperamos seu equipamento com agilidade e garantia.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="https://wa.me/5531999999999?text=Olá! Preciso de um orçamento para minha impressora."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                            >
                                <Smartphone size={20} />
                                Orçamento via WhatsApp
                            </a>
                            <a
                                href="#formulario"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-full backdrop-blur-sm transition-all border border-white/30"
                            >
                                Preencher Formulário
                            </a>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Brands Stripe */}
            <div className="border-b border-gray-100 bg-gray-50 py-8">
                <Container>
                    <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trabalhamos com as principais marcas</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos - Replace with Images later if desired */}
                        <div className="text-2xl font-black text-gray-800">EPSON</div>
                        <div className="text-2xl font-black text-gray-800">Canon</div>
                        <div className="text-2xl font-black text-gray-800">HP</div>
                        <div className="text-2xl font-black text-gray-800">Brother</div>
                        <div className="text-2xl font-black text-gray-800">Samsung</div>
                    </div>
                </Container>
            </div>

            {/* Common Problems */}
            <div className="py-20">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Resolvemos o seu problema</h2>
                        <p className="text-gray-600">
                            Não importa o defeito, nossa equipe técnica está preparada para diagnosticar e resolver.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {problems.map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-14 h-14 rounded-xl bg-orange-50 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Form Section */}
            <div id="formulario" className="bg-slate-900 py-20 text-white">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Solicite um Pré-Orçamento</h2>
                            <p className="text-slate-300 mb-8 text-lg">
                                Preencha os dados abaixo para adiantar seu atendimento.
                                Nossa equipe analisará e entrará em contato com uma estimativa.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <span>Orçamento sem compromisso (Trazendo na loja)</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <span>Peças originais e com garantia</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <span>Técnicos certificados</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl">
                            {formStatus === 'sent' ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Solicitação Enviada!</h3>
                                    <p className="text-gray-600 mb-8">Nossa equipe entrará em contato pelo WhatsApp informado em breve.</p>
                                    <button onClick={() => setFormStatus('idle')} className="text-brand font-bold hover:underline">
                                        Enviar nova solicitação
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Seu Nome</label>
                                        <input required type="text" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="Ex: Maria Silva" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                                        <input required type="tel" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="(31) 99999-9999" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Marca da Impressora</label>
                                            <select className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none">
                                                <option>Epson</option>
                                                <option>HP</option>
                                                <option>Canon</option>
                                                <option>Brother</option>
                                                <option>Outra</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Modelo (Opcional)</label>
                                            <input type="text" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="Ex: L3150" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Qual o defeito?</label>
                                        <textarea required rows={3} className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none" placeholder="Ex: Está manchando o papel..." />
                                    </div>

                                    <button
                                        disabled={formStatus === 'sending'}
                                        type="submit"
                                        className="w-full bg-brand text-white font-bold h-14 rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {formStatus === 'sending' ? 'Enviando...' : (
                                            <>
                                                <Send size={18} />
                                                Enviar Solicitação
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}

const problems = [
    {
        icon: Printer,
        title: "Falhas na Impressão",
        description: "Manchas, riscos, cores erradas ou falhas brancas. Resolvemos entupimentos e problemas de cabeçote."
    },
    {
        icon: AlertTriangle,
        title: "Luzes Piscando",
        description: "Almofadas de tinta cheias (Reset), erro geral ou atolamento de papel. Diagnóstico preciso via software."
    },
    {
        icon: Wrench,
        title: "Não Liga ou Não Puxa",
        description: "Problemas na fonte, placa lógica ou mecanismos de tração de papel. Reparo eletrônico completo."
    }
];
