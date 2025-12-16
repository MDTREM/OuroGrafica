import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    {/* Logo */}
                    <span className="text-2xl font-bold tracking-tight text-gray-900">
                        OURO<span className="text-brand">GRÁFICA</span>
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/produtos" className="text-sm font-medium text-gray-600 hover:text-brand transition-colors">
                        Produtos
                    </Link>
                    <Link href="/servicos" className="text-sm font-medium text-gray-600 hover:text-brand transition-colors">
                        Serviços
                    </Link>
                    <Link href="/sobre" className="text-sm font-medium text-gray-600 hover:text-brand transition-colors">
                        Sobre Nós
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="hidden sm:flex text-gray-900 border-gray-200 hover:border-brand hover:text-brand">
                        Login
                    </Button>
                    <Button className="bg-brand text-white hover:bg-brand/90 font-bold">
                        Orçamento Rápido
                    </Button>
                </div>
            </Container>
        </header>
    );
}
