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
        <div className="relative w-full grid grid-cols-1">
            {normalizedBanners.map((banner, index) => (
                <div
                    key={banner.id || index}
                    className={`col-start-1 row-start-1 w-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <Image
                        src={banner.imageUrl}
                        alt={altText}
                        width={0}
                        height={0}
                        sizes="100vw"
                        priority={index === 0}
                        className="w-full h-auto object-contain"
                    />
                </div>
            ))}
        </div>
    );
}
