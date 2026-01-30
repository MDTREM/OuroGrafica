"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
                <div key={banner.id} className="min-w-full snap-center relative aspect-[2/1] md:aspect-[3/1] flex items-center justify-center bg-gray-50">
                    {banner.link ? (
                        <Link href={banner.link} className="block w-full h-full relative">
                            <Image
                                src={banner.imageUrl}
                                alt="Banner"
                                fill
                                className="object-contain md:object-cover"
                                sizes="(max-width: 768px) 100vw, 100vw"
                            />
                        </Link>
                    ) : (
                        <div className="w-full h-full relative">
                            <Image
                                src={banner.imageUrl}
                                alt="Banner"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 100vw"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
