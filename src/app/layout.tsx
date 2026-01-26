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
  title: {
    template: '%s | Ouro Gráfica Ouro Preto',
    default: 'Ouro Gráfica | Impressão Digital e Soluções em Ouro Preto',
  },
  description: "Sua gráfica de confiança em Ouro Preto e Região. Cartões de visita, banners, aluguel de impressoras e manutenção. Qualidade e agilidade perto de você.",
  keywords: ["Gráfica Ouro Preto", "Impressão Digital", "Aluguel de Impressoras", "Manutenção de Impressoras", "Ouro Preto", "Mariana", "Itabirito", "MDTREM"],
  openGraph: {
    title: "Ouro Gráfica | Impressão Digital em Ouro Preto",
    description: "Cartões, banners e locação de impressoras na Região dos Inconfidentes.",
    url: 'https://ourografica.site',
    siteName: 'Ouro Gráfica Ouro Preto',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
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
