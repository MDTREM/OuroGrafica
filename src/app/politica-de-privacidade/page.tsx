import { Container } from "@/components/ui/Container";

export default function PrivacidadePage() {
    return (
        <Container className="py-12 md:py-20">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
                <div className="prose prose-gray max-w-none text-gray-600">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                    <p>A sua privacidade é importante para nós. É política da Ouro Gráfica respeitar a sua privacidade em relação a qualquer informação que possamos coletar no site Ouro Gráfica, e outros sites que possuímos e operamos.</p>

                    <h3>Coleta de Dados</h3>
                    <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>

                    <h3>Retenção de Dados</h3>
                    <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>

                    <h3>Compartilhamento</h3>
                    <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>
                </div>
            </div>
        </Container>
    );
}
