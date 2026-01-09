import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <Container className="flex flex-col items-center justify-center min-h-[60vh] text-center py-20">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
                <FileQuestion size={64} className="text-gray-400" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">Página não encontrada</h2>

            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Ops! Parece que a página que você está procurando não existe ou foi movida.
            </p>

            <div className="flex gap-4">
                <Link href="/">
                    <Button className="flex items-center gap-2">
                        <Home size={18} />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>
        </Container>
    );
}
