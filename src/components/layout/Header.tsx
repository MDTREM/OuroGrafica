import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    {/* Logo */}
                    <img src="https://i.imgur.com/Kizb68g.png" alt="Vink" className="h-8 w-auto object-contain" />
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/produtos" className="text-sm font-medium text-gray-600 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors">
                        Produtos
                    </Link>
                    <Link href="/sobre" className="text-sm font-medium text-gray-600 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors">
                        Sobre Nós
                    </Link>
                    <Link href="/rastreio" className="text-sm font-medium text-gray-600 hover:text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark transition-colors">
                        Rastreio de Pedido
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="hidden sm:flex text-gray-900 border-gray-200 hover:border-brand hover:text-brand">
                        Login
                    </Button>
                    <Button className="bg-brand text-white hover:bg-brand/90 font-semibold">
                        Orçamento Rápido
                    </Button>
                </div>
            </Container>
        </header>
    );
}
