"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { Shield, Lock, FileText, CheckCircle2, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans selection:bg-brand selection:text-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-6 sticky top-0 z-30 shadow-xs">
                <Container className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-brand transition-colors p-2 hover:bg-gray-50 rounded-full flex items-center justify-center">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 flex-1 text-center pr-10 tracking-tight">Política de Privacidade</h1>
                </Container>
            </div>

            <Container className="pt-10 max-w-4xl mx-auto px-4">
                {/* Hero card with glass effect */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 md:p-10 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
                        <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
                            <Shield size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Sua privacidade é a nossa prioridade número um</h2>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                            Esta política de privacidade explica como a OuroGrafica coleta, utiliza e protege suas informações sob a Lei Geral de Proteção de Dados (LGPD).
                        </p>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    <div className="space-y-6">
                        {/* Section 1 */}
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Lock className="text-brand shrink-0" size={18} />
                                1. Quais dados coletamos e para quê?
                            </h3>
                            <p className="text-xs text-gray-600 font-light leading-relaxed pl-6">
                                Nós coletamos apenas as informações estritamente necessárias para processar seus pedidos de impressos gráficos, realizar a entrega e emitir documentos fiscais obrigatórios:
                            </p>
                            <ul className="list-none space-y-2 pl-6 mt-3">
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span><strong>Identificação pessoal:</strong> Nome completo, CPF ou CNPJ (obrigatórios para fins de faturamento e emissão de notas fiscais).</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span><strong>Contato:</strong> E-mail e telefone/WhatsApp (utilizados para avisos sobre o status do pedido, envio da prévia de arte e rastreamento).</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span><strong>Dados de entrega:</strong> Endereço completo (compartilhado de forma segura apenas com a transportadora parceira para efetuar a entrega).</span>
                                </li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="text-brand shrink-0" size={18} />
                                2. Criptografia e Custo Zero de Risco em Cartões
                            </h3>
                            <p className="text-xs text-gray-600 font-light leading-relaxed pl-6">
                                Visando à máxima segurança cibernética de nossos clientes e em total conformidade com o padrão internacional de segurança de dados do setor de pagamentos (**PCI-DSS**):
                            </p>
                            <p className="text-xs text-gray-600 font-light leading-relaxed pl-6 bg-green-50/50 p-4 rounded-2xl border border-green-100/50 mt-2">
                                <strong>Segurança do Cartão de Crédito:</strong> Nosso site utiliza uma tecnologia de **Tokenização**. Os dados brutos do seu cartão de crédito nunca tocam nossos servidores e nunca são salvos em nosso banco de dados. Eles são enviados de forma diretamente criptografada do seu navegador para o nosso gateway parceiro homologado pelo Banco Central (Asaas/Efí), que retorna uma chave segura que só funciona dentro do nosso sistema fechado.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="text-brand shrink-0" size={18} />
                                3. Seus direitos sob a LGPD
                            </h3>
                            <p className="text-xs text-gray-600 font-light leading-relaxed pl-6">
                                Sob as regras da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você é o proprietário soberano dos seus dados pessoais e possui os seguintes direitos:
                            </p>
                            <ul className="list-none space-y-2 pl-6 mt-3">
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span>Confirmar a existência de tratamento de dados e ter acesso facilitado a eles.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span>Solicitar a **exclusão definitiva** (anonimização) de suas informações do nosso banco de dados a qualquer momento após o encerramento do seu pedido, através de contato oficial.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Lock className="text-brand shrink-0" size={18} />
                                4. Com quem compartilhamos seus dados?
                            </h3>
                            <p className="text-xs text-gray-600 font-light leading-relaxed pl-6">
                                Compartilhamos seus dados estritamente com as entidades necessárias para que o serviço seja prestado com sucesso:
                            </p>
                            <ul className="list-none space-y-2 pl-6 mt-2">
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span><strong>Parceiro de Pagamento (Asaas/Efí):</strong> Para processar a transação do Pix ou Cartão de forma criptografada.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs text-gray-650 font-light">
                                    <CheckCircle2 size={14} className="text-brand mt-0.5 shrink-0" />
                                    <span><strong>Transportadoras (Correios/Jadlog):</strong> Apenas dados de entrega para viabilizar o recebimento físico do seu material no endereço cadastrado.</span>
                                </li>
                            </ul>
                            <p className="text-xs text-gray-650 font-light pl-6 italic mt-2">
                                Nós **nunca** vendemos, alugamos ou comercializamos dados pessoais de nossos usuários para terceiros.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
                        <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                        <Link href="/" className="font-semibold text-brand hover:underline flex items-center gap-1.5 transition-colors">
                            Voltar para a página inicial
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
