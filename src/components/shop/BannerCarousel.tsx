"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Banner } from "@/actions/homepage-actions";

interface BannerCarouselProps {
    banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fallback if no banners provided
    if (!banners || banners.length === 0) return null;

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;

                if (isEnd) {
                    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: "smooth" });
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={scrollRef} className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex rounded-2xl overflow-hidden shadow-sm bg-gray-50">
            {banners.map((banner) => (
                <div key={banner.id} className="min-w-full snap-center relative aspect-[21/9] md:aspect-[3/1] flex items-center justify-center">
                    {banner.link ? (
                        <Link href={banner.link} className="block w-full h-full relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={banner.imageUrl}
                                alt="Banner"
                                className="w-full h-full object-contain"
                            />
                        </Link>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
