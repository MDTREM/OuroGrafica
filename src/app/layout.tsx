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
    default: 'Ouro Gráfica | Impressão, Manutenção e Aluguel em Ouro Preto',
  },
  description: "Gráfica em Ouro Preto, Mariana e Região. Impressão digital, manutenção de impressoras (Epson, HP, Canon) e aluguel de máquinas para empresas (Outsourcing).",
  keywords: [
    "Gráfica Ouro Preto",
    "Gráfica Mariana",
    "Manutenção de Impressora Ouro Preto",
    "Conserto de Impressora Mariana",
    "Aluguel de Impressoras Ouro Preto",
    "Impressão Digital",
    "Cartão de Visita Ouro Preto",
    "Banners",
    "MDTREM"
  ],
  openGraph: {
    title: "Ouro Gráfica | Soluções em Impressão e Manutenção",
    description: "Sua parceira em Ouro Preto para impressos, conserto de impressoras e locação de equipamentos.",
    url: 'https://ourografica.site',
    siteName: 'Ouro Gráfica',
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
