"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TimeLine_01Entry = {
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
};

const defaultTimelineData: TimeLine_01Entry[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop",
    title: "Logo & Identidade",
    subtitle: "A base da sua presença no mercado",
    description:
      "Criamos uma identidade visual alinhada com a proposta do seu negócio, garantindo que sua marca seja reconhecida instantaneamente. Não entregamos apenas um desenho; entregamos um ecossistema visual completo.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
    title: "Cardápios Estratégicos",
    subtitle: "Sua principal ferramenta de vendas",
    description:
      "O cardápio é sua principal ferramenta de vendas. Aplicamos estratégia e design para destacar os itens mais lucrativos e tornar a experiência do cliente mais intuitiva e irresistível.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1628102491629-77858ab216b2?q=80&w=1000&auto=format&fit=crop",
    title: "O conceito de Viral Packing",
    subtitle: "Embalagem que vira divulgação grátis",
    description:
      "Na era do TikTok e Instagram, embalagem bonita vira story e divulgação grátis. A ideia do Viral Packing é criar experiências que fazem o cliente querer mostrar sua marca na internet.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1606132717833-2eb59b5832a8?q=80&w=1000&auto=format&fit=crop",
    title: 'Embalagens "Instagramáveis"',
    subtitle: "Cada entrega é uma oportunidade de marketing",
    description:
      "Cada entrega será uma oportunidade de marketing. As embalagens vão fazer cada entrega parecer especial, conectando o cliente com a essência da sua marca e elevando o valor percebido.",
  },
];

interface TimelineProps {
  data?: TimeLine_01Entry[];
}

export function BrandingTimeline({ data = defaultTimelineData }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight;

      // Check visibility of each item
      const items = containerRef.current.querySelectorAll("[data-timeline-item]");
      const newVisible = new Set<number>();
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < viewportHeight * 0.8) {
          newVisible.add(index);
        }
      });
      setVisibleItems(newVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-16 md:space-y-20">
        {data.map((entry, index) => {
          const isVisible = visibleItems.has(index);
          return (
            <div
              key={index}
              data-timeline-item
              className={cn(
                "transition-all duration-700 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Card */}
              <div
                className={cn(
                  "rounded-2xl border p-0 overflow-hidden transition-all duration-500",
                  isVisible
                    ? "bg-gray-50/50 border-gray-200 shadow-sm"
                    : "bg-white border-gray-100"
                )}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="p-6 md:p-8">
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-medium text-black tracking-tight">
                    {entry.title}
                  </h3>

                  {/* Subtitle (below title) */}
                  <p
                    className={cn(
                      "text-sm font-light mt-1 mb-4 transition-colors duration-500",
                      isVisible ? "text-gray-500" : "text-gray-400"
                    )}
                  >
                    {entry.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base">
                    {entry.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
