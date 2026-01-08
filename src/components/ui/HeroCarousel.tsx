'use client';

import { useState, useEffect } from 'react';

import { Banner } from '@/actions/homepage-actions';

interface HeroCarouselProps {
    banners: (Banner | string)[]; // Support both for backward compatibility temporarily, though ideally just Banner[]
    interval?: number;
}

export function HeroCarousel({ banners, interval = 5000 }: HeroCarouselProps) {
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
                    <picture className="w-full h-full block">
                        {banner.mobileImageUrl && <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />}
                        <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                    </picture>
                </div>
            ))}
            {/* Optional Overlay for readability if wanted later, currently removed per request */}
            {/* <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" /> */}
        </div>
    );
}
