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
                        className="w-full aspect-[2.5/1] rounded-2xl relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                        {banner.link ? (
                            <Link href={banner.link} className="block w-full h-full relative">
                                <Image
                                    src={banner.imageUrl}
                                    alt="Banner"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </Link>
                        ) : (
                            <div className="w-full h-full relative">
                                <Image
                                    src={banner.imageUrl}
                                    alt="Banner"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Container>
    );
}
