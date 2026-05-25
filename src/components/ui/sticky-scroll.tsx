'use client';

import React, { forwardRef, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Case {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover_image: string | null;
}

interface StickyScrollProps {
  cases: Case[];
}

const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(({ cases }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Framer Motion scroll target
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Sides scroll faster (pull up dynamically as user scrolls down)
  const ySides = useTransform(scrollYProgress, [0, 1], [80, -80]);
  // Center scrolls slower (pushed down slightly to amplify the relative movement)
  const yCenter = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  // Helper to get case cyclic-wise or return a placeholder if none exist
  const getCaseAt = (index: number) => {
    if (!cases || cases.length === 0) {
      // Premium curated food branding placeholders
      const placeholders = [
        {
          title: "Burguer Artesanal",
          category: "Identidade Visual & Embalagem",
          cover_image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop",
          slug: "#"
        },
        {
          title: "Pastry & Doces Finos",
          category: "Branding Strategic",
          cover_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop",
          slug: "#"
        },
        {
          title: "Bacio di Latte",
          category: "Experiência de Embalagem",
          cover_image: "https://images.unsplash.com/photo-1628102491629-77858ab216b2?w=600&auto=format&fit=crop",
          slug: "#"
        },
        {
          title: "Sushibar Experience",
          category: "Menu Design & Branding",
          cover_image: "https://images.unsplash.com/photo-1606132717833-2eb59b5832a8?w=600&auto=format&fit=crop",
          slug: "#"
        }
      ];
      return placeholders[index % placeholders.length];
    }
    const item = cases[index % cases.length];
    return {
      title: item.title,
      category: item.category,
      cover_image: item.cover_image || "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop",
      slug: `/portfolio/${item.slug}`
    };
  };

  const renderFigure = (index: number, aspectClass: string) => {
    const item = getCaseAt(index);
    if (!item) return null;

    const FigureContent = (
      <figure className={`relative group overflow-hidden rounded-xl border border-gray-100 shadow-sm w-full ${aspectClass}`}>
        <img
          src={item.cover_image}
          alt={item.title}
          className="transition-all duration-700 w-full h-full object-cover group-hover:scale-105"
        />
        {/* Overlay showing Title and Category on hover */}
        <div className="absolute inset-0 bg-brand/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-center p-6 select-none cursor-pointer">
          <h4 className="text-white text-lg md:text-xl font-bold tracking-tight mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            {item.title}
          </h4>
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
            {item.category}
          </p>
        </div>
      </figure>
    );

    if (item.slug === "#") {
      return <div key={index}>{FigureContent}</div>;
    }

    return (
      <Link href={item.slug} key={index} className="block w-full">
        {FigureContent}
      </Link>
    );
  };

  return (
    <main className="bg-white overflow-hidden" ref={ref}>
      <section ref={containerRef} className="text-gray-900 w-full bg-white py-8">
        <div className="grid grid-cols-12 gap-4">
          {/* Column 1 (Left): 3 square images, scrolling faster */}
          <motion.div style={{ y: ySides }} className="grid gap-4 col-span-4">
            {renderFigure(0, "aspect-square w-full")}
            {renderFigure(1, "aspect-square w-full")}
            {renderFigure(2, "aspect-square w-full")}
          </motion.div>

          {/* Column 2 (Center): 3 square images, scrolling slower */}
          <motion.div style={{ y: yCenter }} className="grid gap-4 col-span-4">
            {renderFigure(3, "aspect-square w-full")}
            {renderFigure(4, "aspect-square w-full")}
            {renderFigure(5, "aspect-square w-full")}
          </motion.div>

          {/* Column 3 (Right): 3 square images, scrolling faster */}
          <motion.div style={{ y: ySides }} className="grid gap-4 col-span-4">
            {renderFigure(6, "aspect-square w-full")}
            {renderFigure(7, "aspect-square w-full")}
            {renderFigure(8, "aspect-square w-full")}
          </motion.div>
        </div>
      </section>
    </main>
  );
});

StickyScroll.displayName = 'StickyScroll';

export default StickyScroll;
