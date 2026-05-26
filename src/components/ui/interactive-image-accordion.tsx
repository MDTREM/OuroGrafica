"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// --- Data for the image accordion ---
export interface AccordionItemData {
  id: number;
  title: string;
  imageUrl: string;
}

export const brandingAccordionItems: AccordionItemData[] = [
  {
    id: 1,
    title: "Logo & Identidade",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Cardápios Estratégicos",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Viral Packing",
    imageUrl: "https://images.unsplash.com/photo-1628102491629-77858ab216b2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Embalagens Instagramáveis",
    imageUrl: "https://images.unsplash.com/photo-1606132717833-2eb59b5832a8?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Estratégia & Posicionamento",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
  },
];

interface AccordionItemProps {
  item: AccordionItemData;
  isActive: boolean;
  onMouseEnter: () => void;
}

// --- Accordion Item Component ---
const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
  return (
    <div
      className={cn(
        "relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden cursor-pointer",
        "transition-all duration-700 ease-in-out shrink-0 select-none",
        isActive ? "w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px]" : "w-[50px] sm:w-[60px]"
      )}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "https://placehold.co/400x450/2d3748/ffffff?text=Image+Error";
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/30" />

      {/* Caption Text */}
      <span
        className={cn(
          "absolute text-white text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap",
          "transition-all duration-500 ease-in-out pointer-events-none select-none",
          isActive
            ? "bottom-6 left-6 rotate-0 opacity-100" // Active state: horizontal, bottom-left
            : "bottom-36 md:bottom-40 left-1/2 -translate-x-1/2 rotate-90 origin-center opacity-70" // Inactive state: vertical centered, no clipping
        )}
      >
        {item.title}
      </span>
    </div>
  );
};

interface LandingAccordionProps {
  items?: AccordionItemData[];
}

// --- Main App Component ---
export function LandingAccordionItem({ items = brandingAccordionItems }: LandingAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleItemHover = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto py-4 w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => handleItemHover(index)}
        />
      ))}
    </div>
  );
}
