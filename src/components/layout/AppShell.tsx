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

    if (isAuthPage) {
        return <main className="flex-1">{children}</main>;
    }

    return (
        <>
            <TopBar />
            <DesktopNav />
            <main className="flex-1">
                {children}
            </main>
            <div className="hidden md:block">
                <Footer />
            </div>
            <BottomNav />
        </>
    );
}
