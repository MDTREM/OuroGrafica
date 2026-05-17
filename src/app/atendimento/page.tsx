"use client";

import { Container } from "@/components/ui/Container";
import { Mail, Phone, MessageCircle, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AtendimentoPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-100 py-12">
                <Container className="text-center">
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Central de Atendimento</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Estamos aqui para ajudar! Entre em contato conosco através dos nossos canais ou tire suas dúvidas abaixo.
                    </p>
                </Container>
            </div>

            <Container className="py-12">
                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/5531989880161"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/30 transition-all group text-center"
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp</h3>
                        <p className="text-gray-500 mb-4">Atendimento rápido e personalizado.</p>
                        <span className="text-lg font-semibold text-green-700">(31) 98988-0161</span>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:vinkimpressos@gmail.com"
                        className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/30 transition-all group text-center"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Mail size={32} className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">E-mail</h3>
                        <p className="text-gray-500 mb-4">Para orçamentos detalhados e dúvidas.</p>
                        <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">vinkimpressos@gmail.com</span>
                    </a>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Perguntas Frequentes</h2>

                    <div className="space-y-4">
                        <FaqItem
                            question="Vocês entregam em todo o Brasil?"
                            answer="Sim! Realizamos entregas para todo o território nacional via Correios ou transportadoras parceiras. O valor do frete e o prazo de entrega podem ser calculados diretamente no seu carrinho de compras."
                        />
                        <FaqItem
                            question="Quais são as formas de pagamento?"
                            answer="Aceitamos Cartão de Crédito (parcelamento disponível), Pix com aprovação imediata e Boleto Bancário. Todas as transações são processadas com segurança."
                        />
                        <FaqItem
                            question="Como envio o arquivo para impressão?"
                            answer="Diretamente na página do produto, você encontrará a área de upload para enviar sua logomarca ou arte pronta. Aceitamos arquivos em PDF, PNG ou JPG para garantir a melhor qualidade de impressão."
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
            >
                <div className="p-5 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                    {answer}
                </div>
            </div>
        </div>
    );
}
