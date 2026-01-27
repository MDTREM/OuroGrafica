import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Instagram, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-surface border-t border-border mt-auto pb-24 md:pb-8">
            <Container className="py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Logo & Social */}
                    <div className="space-y-4">
                        <img src="https://i.imgur.com/gvQGNPA.png" alt="Ouro Gráfica" className="h-8 w-auto object-contain mb-4" />

                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/graficaouro/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand transition-colors p-2 bg-surface-secondary rounded-full border border-border hover:border-brand">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.facebook.com/people/Ouro-Gr%C3%A1fica/61583717952045/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand transition-colors p-2 bg-surface-secondary rounded-full border border-border hover:border-brand">
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Policies */}
                    <div>
                        <h3 className="font-bold text-foreground mb-4">Políticas</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/politica-de-cookies" className="hover:text-brand transition-colors">Política de Cookies</Link></li>
                            <li><Link href="/termos-de-uso" className="hover:text-brand transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/politica-de-privacidade" className="hover:text-brand transition-colors">Política de Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Security */}
                    <div>
                        <h3 className="font-bold text-foreground mb-4">Segurança</h3>
                        <div className="flex items-center gap-2">
                            <img src="https://i.imgur.com/eP7c5HZ.png" alt="Site Blindado" className="h-10 w-auto object-contain" />
                        </div>
                    </div>

                    {/* Column 4: Serviços (SEO) */}
                    <div>
                        <h3 className="font-bold text-foreground mb-4">Serviços</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/servicos/manutencao" className="hover:text-brand transition-colors">Manutenção de Impressoras</Link></li>
                            <li><Link href="/servicos/outsourcing" className="hover:text-brand transition-colors">Locação de Impressoras</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: CNPJ */}
                    <div>
                        <h3 className="font-bold text-foreground mb-4">Informações Legais</h3>
                        <p className="text-sm text-gray-500">
                            CNPJ: 27.619.752/0001-91
                        </p>
                    </div>

                </div>
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Ouro Gráfica. Todos os direitos reservados.</p>
                </div>
            </Container>
        </footer>
    );
}
