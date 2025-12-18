import { Container } from "@/components/ui/Container";

export default function CookiesPage() {
    return (
        <Container className="py-12 md:py-20">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Cookies</h1>
                <div className="prose prose-gray max-w-none text-gray-600">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <h3>O que são cookies?</h3>
                    <p>Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência. Esta página descreve quais informações eles coletam, como as usamos e por que às vezes precisamos armazenar esses cookies.</p>

                    <h3>Como usamos os cookies?</h3>
                    <p>Utilizamos cookies por vários motivos. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site. É recomendável que você deixe todos os cookies se não tiver certeza se precisa ou não deles, caso sejam usados ​​para fornecer um serviço que você usa.</p>

                    <h3>Desativar cookies</h3>
                    <p>Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a Ajuda do navegador para saber como fazer isso). Esteja ciente de que a desativação de cookies afetará a funcionalidade deste e de muitos outros sites que você visita.</p>
                </div>
            </div>
        </Container>
    );
}
