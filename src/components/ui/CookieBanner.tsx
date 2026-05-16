'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Container } from './Container';
import { X, Cookie } from 'lucide-react';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-500">
            <Container className="py-4 md:py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex p-3 bg-gradient-to-r from-brand to-brand-dark/10 rounded-full text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                            <Cookie size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nós valorizamos sua privacidade</h3>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                                Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdos.
                                Ao continuar navegando, você concorda com nossa <a href="/politica-de-privacidade" className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark font-semibold hover:underline">Política de Privacidade</a>.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleDecline}
                            className="flex-1 md:flex-none border-gray-300 hover:bg-gray-50"
                        >
                            Recusar
                        </Button>
                        <Button
                            onClick={handleAccept}
                            className="flex-1 md:flex-none bg-gradient-to-r from-brand to-brand-dark text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark-foreground hover:bg-gradient-to-r from-brand to-brand-dark/90"
                        >
                            Aceitar Cookies
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}
