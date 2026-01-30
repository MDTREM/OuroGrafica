'use client';

import { useState, useEffect } from 'react';

import { Banner } from '@/actions/homepage-actions';

import Image from 'next/image';

interface HeroCarouselProps {
    banners: (Banner | string)[]; // Support both for backward compatibility temporarily, though ideally just Banner[]
    interval?: number;
    altText?: string;
}

export function HeroCarousel({ banners, interval = 5000, altText = "Banner Promocional Ouro Gráfica" }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Normalize input to Banner[]
    const normalizedBanners: Banner[] = banners.map(b => {
        if (typeof b === 'string') return { id: b, imageUrl: b };
        return b;
    });

    useEffect(() => {
        if (normalizedBanners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % normalizedBanners.length);
        }, interval);

        return () => clearInterval(timer);
    }, [normalizedBanners.length, interval]);

    if (!normalizedBanners || normalizedBanners.length === 0) return null;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            {normalizedBanners.map((banner, index) => (
                <div
                    key={banner.id || index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <div className="relative w-full h-full">
                        {/* Mobile Image (if available) - Needs art direction strategy with next/image or CSS display toggle */}
                        {/* For simplicity while maintaining optimization, we render both and toggle via CSS if needed, 
                             but standarizing on one responsive Image with object-cover is usually safer for maintenance unless perfectly cropped.
                             For now, using the main imageUrl as priority. */}
                        <Image
                            src={banner.imageUrl}
                            alt={altText}
                            fill
                            priority={index === 0} // LCP optimization for the first slide
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 100vw"
                        />
                    </div>
                </div>
            ))}

            {/* Optional Overlay for readability if wanted later, currently removed per request */}
            {/* <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" /> */}
        </div>
    );
}
