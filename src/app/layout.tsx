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
  metadataBase: new URL('https://vink.com.br'),
  title: {
    template: '%s | Vink',
    default: 'Vink | Especialistas em Branding e Embalagens',
  },
  description: "A Vink é sua parceira estratégica para branding, embalagens e impressos de alta qualidade. Soluções completas para potencializar a sua marca.",
  keywords: [
    "Vink",
    "Branding",
    "Embalagens Personalizadas",
    "Agência de Design",
    "Impressão Digital Premium",
    "Identidade Visual",
    "Materiais Gráficos"
  ],
  openGraph: {
    title: "Vink | Especialistas em Branding e Embalagens",
    description: "Soluções completas de branding e impressos para potencializar a sua marca.",
    url: 'https://vink.com.br',
    siteName: 'Vink',
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
        className={`${outfit.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
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
