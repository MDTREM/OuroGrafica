import { Container } from "@/components/ui/Container";

export default function TermosPage() {
    return (
        <Container className="py-12 md:py-20">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
                <div className="prose prose-gray max-w-none text-gray-600">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                    <p>Bem-vindo à Ouro Gráfica.</p>
                    <p>Ao acessar nosso site, você concorda com estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>

                    <h3>1. Uso de Licença</h3>
                    <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Ouro Gráfica, apenas para visualização transitória pessoal e não comercial.</p>

                    <h3>2. Isenção de responsabilidade</h3>
                    <p>Os materiais no site da Ouro Gráfica são fornecidos 'como estão'. A Ouro Gráfica não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</p>

                    <h3>3. Limitações</h3>
                    <p>Em nenhum caso a Ouro Gráfica ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Ouro Gráfica.</p>
                </div>
            </div>
        </Container>
    );
}
