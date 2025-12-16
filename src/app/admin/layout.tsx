"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { AdminMobileTopBar } from "@/components/admin/AdminMobileTopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (!isAdmin) {
                router.push("/");
            }
        }
    }, [user, isLoading, isAdmin, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Carregando...</div>;
    }

    if (!user || !isAdmin) {
        return null;
    }

    return <>{children}</>;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex bg-gray-50 min-h-screen">
                <AdminSidebar />
                <AdminMobileTopBar />
                <main className="flex-1 overflow-auto h-screen pb-20 lg:pb-0 pt-16 lg:pt-0">
                    <div className="p-8 pb-20">
                        {children}
                    </div>
                </main>
                <AdminBottomNav />
            </div>
        </AdminGuard>
    );
}
