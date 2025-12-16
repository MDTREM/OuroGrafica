import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { AdminMobileTopBar } from "@/components/admin/AdminMobileTopBar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
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
    );
}
