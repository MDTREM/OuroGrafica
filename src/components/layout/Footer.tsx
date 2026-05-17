import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Instagram, Facebook } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#191919] text-white mt-auto pb-8">
            <Container className="py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Social */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors p-2 bg-white/5 rounded-full border border-white/10 hover:border-brand">
                                <Instagram size={20} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors p-2 bg-white/5 rounded-full border border-white/10 hover:border-brand">
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Policies */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Políticas</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/politica-de-cookies" className="hover:text-brand transition-colors">Política de Cookies</Link></li>
                            <li><Link href="/termos-de-uso" className="hover:text-brand transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/politica-de-privacidade" className="hover:text-brand transition-colors">Política de Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Security */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Segurança</h3>
                        <div className="flex items-center gap-2">
                            <img src="/selo-seguranca.png" alt="Site Blindado" className="h-10 w-auto object-contain" />
                        </div>
                    </div>

                    {/* Column 4: CNPJ */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Informações Legais</h3>
                        <p className="text-sm text-gray-400">
                            CNPJ: 00.000.000/0001-00
                        </p>
                    </div>

                </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
                    <p>&copy; {new Date().getFullYear()} Vink. Todos os direitos reservados.</p>
                    <p>
                        Feito por <a href="https://matheusdinizdesign.site/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand transition-colors font-medium">Matheus Diniz Designer</a>
                    </p>
                </div>
            </Container>
        </footer>
    );
}
