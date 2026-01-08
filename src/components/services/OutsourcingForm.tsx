"use client";

import { useState } from "react";
import { Printer, CheckCircle } from "lucide-react";
import { submitQuoteRequest } from "@/actions/quote-actions";

export function OutsourcingForm() {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

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

        const res = await submitQuoteRequest(data);

        if (res.success) {
            setFormStatus('sent');
        } else {
            setFormStatus('idle'); // Handle error ideally
            alert('Erro ao enviar. Tente novamente.');
        }
    }

    return (
        <div id="contato" className="py-8 bg-gray-50/50 -mx-4 md:-mx-8 lg:-mx-16 px-4 md:px-8 lg:px-16">
            <div className="container mx-auto">
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
                            Orçamento Rápido
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
