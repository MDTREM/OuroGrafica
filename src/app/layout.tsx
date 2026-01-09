import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleAnalytics } from '@next/third-parties/google';
import { CookieBanner } from "@/components/ui/CookieBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ourografica.site'),
  title: "Ouro Gráfica | Impressão Digital e Manutenção de Impressoras",
  description: "Destaque sua marca com cartões de visita, flyers e materiais gráficos premium.",
  openGraph: {
    title: "Ouro Gráfica | Impressão Digital de Alta Qualidade",
    description: "Cartões de visita, flyers, banners e manutenção de impressoras em Ouro Preto.",
    url: 'https://ourografica.site',
    siteName: 'Ouro Gráfica',
    locale: 'pt_BR',
    type: 'website',
  },
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
                  <CookieBanner />
                </AppShell>
              </AdminProvider>
            </AuthProvider>
          </FavoritesProvider>
        </CartProvider>
        <GoogleAnalytics gaId="G-1SYW5MM5VB" />
        <SpeedInsights />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
