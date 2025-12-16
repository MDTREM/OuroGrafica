"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/login") ||
        pathname?.startsWith("/cadastro") ||
        pathname?.startsWith("/recuperar-senha") ||
        pathname?.startsWith("/admin");

    // Hide nav elements on specific pages to reduce distraction
    const isProductPage = pathname?.startsWith("/produto/");
    const isPrinterPage = pathname?.startsWith("/servicos/aluguel/") && pathname !== "/servicos/aluguel";

    const isImmersivePage = isProductPage || isPrinterPage;

    if (isAuthPage) {
        return <main className="flex-1">{children}</main>;
    }

    return (
        <>
            {/* TopBar: Hide on mobile for immersive pages (since they have custom nav), show on desktop */}
            <div className={isImmersivePage ? "hidden md:block" : "block"}>
                <TopBar />
            </div>

            <DesktopNav />

            <main className="flex-1">
                {children}
            </main>
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* BottomNav: Hide completely on immersive pages */}
            {!isImmersivePage && <BottomNav />}
        </>
    );
}
