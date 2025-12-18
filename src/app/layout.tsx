import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ouro Gráfica | Impressão de Alta Qualidade",
  description: "Destaque sua marca com cartões de visita, flyers e materiais gráficos premium.",
  icons: {
    icon: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen pb-16 md:pb-0`}
      >
        <CartProvider>
          <FavoritesProvider>
            <AuthProvider>
              <AdminProvider>
                <AppShell>
                  {children}
                </AppShell>
              </AdminProvider>
            </AuthProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
