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
                <div key={banner.id} className="min-w-full snap-center flex items-center justify-center bg-gray-50">
                    <Link href={banner.link || '#'} className={`block w-full h-full ${!banner.link ? 'pointer-events-none' : ''}`}>
                        {/* Mobile Image (Visible only on mobile if available) */}
                        {banner.mobileImageUrl && (
                            <div className="block md:hidden w-full h-auto">
                                <Image
                                    src={banner.mobileImageUrl}
                                    alt="Banner Mobile"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-auto"
                                />
                            </div>
                        )}

                        {/* Desktop Image (Hidden on mobile if mobile image exists) */}
                        <div className={`${banner.mobileImageUrl ? 'hidden md:block' : 'block'} w-full h-auto`}>
                            <Image
                                src={banner.imageUrl}
                                alt="Banner Desktop"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto"
                            />
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
}
