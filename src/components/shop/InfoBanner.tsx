"use client";

import { useEffect, useRef } from "react";
import { CreditCard, Truck, ShieldCheck, PenTool, Star, Heart, Check, Clock, MapPin, Phone, Package, Zap, Award, Gift } from "lucide-react";
import { Container } from "@/components/ui/Container";

// Mapa de ícones disponíveis para o admin escolher
const ICON_MAP: Record<string, any> = {
    "credit-card": CreditCard,
    "truck": Truck,
    "shield": ShieldCheck,
    "pen": PenTool,
    "star": Star,
    "heart": Heart,
    "check": Check,
    "clock": Clock,
    "map": MapPin,
    "phone": Phone,
    "package": Package,
    "zap": Zap,
    "award": Award,
    "gift": Gift
};

export interface BannerItem {
    id?: string;
    icon: string;
    title: string;
    subtitle: string;
    link?: string;
    linkText?: string;
}

interface InfoBannerProps {
    items?: BannerItem[];
}

export function InfoBanner({ items }: InfoBannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fallback padrão no estilo Printi
    const displayItems = items && items.length > 0 ? items : [
        { icon: "gift", title: "Primeira compra?", subtitle: "Seu cupom tá aqui!", link: "/cupons", linkText: "Confira" },
        { icon: "truck", title: "Envio rápido e seguro", subtitle: "Entrega para todo o Brasil", link: "/termos", linkText: "Entenda" },
        { icon: "shield", title: "Compra Segura", subtitle: "Satisfação garantida", link: "/termos", linkText: "Entenda" },
        { icon: "pen", title: "Design Profissional", subtitle: "Fazemos a sua arte", link: "/branding", linkText: "Confira" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current && window.innerWidth < 768) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;
 
                if (isEnd) {
                    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: "smooth" });
                }
            }
        }, 2000); // 2 segundos por item
 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white border-b border-gray-100 overflow-hidden">
            <Container className="px-0 md:px-4">
                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-4">
                    {displayItems.map((item, index) => {
                        const IconComponent = ICON_MAP[item.icon] || Star;
                        const isLast = index === displayItems.length - 1;
                        return (
                            <div
                                key={item.id || index}
                                className={`flex items-center gap-4 px-6 py-6 ${!isLast ? 'border-r border-gray-100' : ''}`}
                            >
                                <div className="text-gray-800 shrink-0">
                                    <IconComponent size={28} strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-[14px] leading-tight">{item.title}</h3>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Carousel (Smaller Height) */}
                <div className="md:hidden">
                    <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-12">
                        {displayItems.map((item, index) => {
                            const IconComponent = ICON_MAP[item.icon] || Star;
                            return (
                                <div
                                    key={index}
                                    className="min-w-full h-full flex items-center justify-center gap-2 snap-center px-4"
                                >
                                    <IconComponent size={16} strokeWidth={2} className="text-brand" />
                                    <span className="text-[11px] font-semibold text-gray-900 truncate">
                                        {item.title} • <span className="text-gray-500 font-medium">{item.subtitle}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </div>
    );
}

