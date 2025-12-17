'use client';

import { useState, useEffect } from 'react';

interface HeroCarouselProps {
    banners: string[];
    interval?: number;
}

export function HeroCarousel({ banners, interval = 5000 }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, interval);

        return () => clearInterval(timer);
    }, [banners, interval]);

    if (!banners || banners.length === 0) return null;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            {banners.map((banner, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    style={{ backgroundImage: `url('${banner}')` }}
                />
            ))}
            {/* Optional Overlay for readability if wanted later, currently removed per request */}
            {/* <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" /> */}
        </div>
    );
}
