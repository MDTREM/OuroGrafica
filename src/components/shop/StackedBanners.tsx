import { Container } from "@/components/ui/Container";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Banner } from "@/actions/homepage-actions";

interface StackedBannersProps {
    banners: Banner[];
}

export function StackedBanners({ banners }: StackedBannersProps) {
    // If no banners, show nothing (or we could show default fallback)
    if (!banners || banners.length === 0) return null;

    return (
        <Container className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className="w-full relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] rounded-2xl"
                    >
                        <Link href={banner.link || '#'} className={`block w-full h-full ${!banner.link ? 'pointer-events-none' : ''}`}>
                            {/* Mobile Image */}
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

                            {/* Desktop Image */}
                            <div className={`${banner.mobileImageUrl ? 'hidden md:block' : 'block'} w-full h-auto`}>
                                <Image
                                    src={banner.imageUrl}
                                    alt="Banner"
                                    width={0}
                                    height={0}
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="w-full h-auto"
                                />
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </Container>
    );
}
