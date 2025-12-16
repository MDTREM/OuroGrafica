"use client";

import Link from "next/link";
import { Container } from "../ui/Container";
import { Wrench, ArrowRight } from "lucide-react";

export function MaintenanceCTA() {
    return (
        <div className="py-8">
            <Container>
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl group">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/10" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-blue-50 mb-4 backdrop-blur-sm">
                                <Wrench size={16} />
                                Novo Serviço
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Assistência Técnica de Impressoras
                            </h2>
                            <p className="text-blue-100 text-lg max-w-xl">
                                Sua impressora parou? Agora a Ouro Gráfica conserta seu equipamento com peças originais e garantia. Atendemos Epson, HP, Canon e mais.
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <Link
                                href="/servicos/manutencao"
                                className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold py-4 px-8 rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Agendar Manutenção
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
