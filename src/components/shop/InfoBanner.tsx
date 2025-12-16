"use client";

import { CreditCard, Truck, ShieldCheck, PenTool, Star, Heart, Check, Clock, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useEffect, useRef } from "react";

// Icon mapping
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
    "phone": Phone
};

export interface BannerItem {
    id?: string;
    icon: string;
    title: string;
    subtitle: string;
}

interface InfoBannerProps {
    items?: BannerItem[];
}

export function InfoBanner({ items }: InfoBannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Default Items fallback
    const displayItems = items && items.length > 0 ? items : [
        { icon: "credit-card", title: "Cartão de crédito", subtitle: "pagamento em até 6x" },
        { icon: "truck", title: "Entregamos", subtitle: "em todo Brasil" },
        { icon: "shield", title: "Compra garantida", subtitle: "loja 100% segura" },
        { icon: "pen", title: "Design Profissional", subtitle: "Fazemos a sua arte" }
    ];

    useEffect(() => {
        // Only auto-scroll on mobile/small screens where scrolling happens
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

                // If content fits, no need to scroll
                if (scrollWidth <= clientWidth) return;

                const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;

                if (isEnd) {
                    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: "smooth" });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-surface py-6 border-b border-border">
            <Container>
                <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar gap-8 md:justify-between snap-x snap-mandatory">
                    {displayItems.map((item, index) => {
                        const IconComponent = ICON_MAP[item.icon] || Star;
                        return (
                            <div key={index} className="flex items-center justify-center md:justify-start gap-4 min-w-full md:min-w-0 snap-center flex-shrink-0 md:flex-shrink">
                                <div className="text-brand">
                                    <IconComponent size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </div>
    );
}
