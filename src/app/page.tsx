import { Container } from "@/components/ui/Container";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { BannerCarousel } from "@/components/shop/BannerCarousel";
import { InfoBanner } from "@/components/shop/InfoBanner";
import { StackedBanners } from "@/components/shop/StackedBanners";
import { ProductRow } from "@/components/shop/ProductRow";
import { CATEGORIES } from "@/data/mockData";
import { MaintenanceCTA } from "@/components/shop/MaintenanceCTA";
import { LocationMap } from "@/components/shop/LocationMap";
import { BlogPreviewSection } from "@/components/shop/BlogPreviewSection";
import { getHomepageConfig, Section } from "@/actions/homepage-actions";
import { supabase } from "@/lib/supabase"; // Import supabase
import { Product } from "@/data/mockData";
import { mapProduct } from "@/lib/product-mapper";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gráfica em Ouro Preto | Impressão Digital e Personalizados",
  description: "Procurando Gráfica em Ouro Preto? Cartões de visita, banners, adesivos, encadernação e personalizados. Atendemos Ouro Preto, Mariana e toda região.",
  alternates: {
    canonical: 'https://ourografica.site',
  },
};

// Helper to fetch products for a section
async function getProductsForSection(section: Section): Promise<Product[]> {
  const { data: allProducts } = await supabase.from('products').select('*').eq('active', true);
  if (!allProducts) return [];

  // Map database columns to Product interface (camelCase)
  let filtered = allProducts.map(mapProduct);

  if (section.settings?.productIds && section.settings.productIds.length > 0) {
    // Manual selection
    // Manual selection ensuring order
    const ids = section.settings.productIds;
    filtered = filtered.filter(p => ids.includes(p.id));
    filtered.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  } else {
    // Filter logic matches ProductRow client-side logic
    switch (section.settings?.filter) {
      case 'best-sellers':
        filtered = filtered.filter(p => p.isBestSeller);
        break;
      case 'featured':
        filtered = filtered.filter(p => p.isFeatured);
        break;
      case 'new':
        filtered = filtered.filter(p => p.isNew);
        break;
    }
    // Limit
    filtered = filtered.slice(0, 4);
  }
  return filtered;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ouro Gráfica",
  "image": "https://ourografica.site/icon.png",
  "@id": "https://ourografica.site",
  "url": "https://ourografica.site",
  "telephone": "+5531982190935",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua José Moringa, 9",
    "addressLocality": "Ouro Preto",
    "addressRegion": "MG",
    "postalCode": "35400-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -20.3920977,
    "longitude": -43.5188806
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "08:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.instagram.com/graficaouro/",
    "https://www.facebook.com/people/Ouro-Gr%C3%A1fica/61583717952045/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços Gráficos e de TI",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Manutenção de Impressoras",
          "url": "https://ourografica.site/servicos/manutencao"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Aluguel de Impressoras (Outsourcing)",
          "url": "https://ourografica.site/servicos/outsourcing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Impressão Digital e Gráfica Rápida"
        }
      }
    ]
  }
};


export default async function Home() {
  const config = await getHomepageConfig();

  // Pre-fetch products for all product-row sections
  const productSectionsToCheck = config.sections.filter(s => s.type === 'product-row' && s.enabled);
  const productsMap: Record<string, Product[]> = {};

  for (const section of productSectionsToCheck) {
    productsMap[section.id] = await getProductsForSection(section);
  }

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'banner-carousel':
        return (
          <Container key={section.id} className="pt-4">
            <BannerCarousel banners={section.banners || []} />
          </Container>
        );
      case 'info-banner':
        return <InfoBanner key={section.id} items={section.benefits} />;
      case 'categories':
        return (
          <Container key={section.id}>
            {section.title && <h2 className="text-xl font-bold mb-4">{section.title}</h2>}
            <CategoryNav activeCategory="todos" />
          </Container>
        );
      case 'product-row':
        // Use pre-fetched products
        return (
          <ProductRow
            key={section.id}
            title={section.title || section.name}
            filter={section.settings?.filter || 'best-sellers'}
            productIds={section.settings?.productIds}
            preloadedProducts={productsMap[section.id] || []}
          />
        );
      case 'stacked-banners':
        return <StackedBanners key={section.id} banners={section.banners || []} />;
      case 'maintenance-cta':
        return <MaintenanceCTA key={section.id} />;
      case 'blog-preview':
        return <BlogPreviewSection key={section.id} title={section.title} postIds={section.settings?.postIds} />;
      default:
        return null;
    }
  };

  const bannerSection = config.sections.find(s => s.type === 'banner-carousel' && s.enabled);
  const otherSections = config.sections.filter(s => s.enabled && s.type !== 'banner-carousel');

  return (
    <div className="pb-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Main Banner (if exists) */}
      {bannerSection && renderSection(bannerSection)}

      {/* 2. Dynamic Sections */}
      {otherSections.map(section => renderSection(section))}

      {/* 4. Location Map */}
      <LocationMap />
      <WhatsAppButton />
    </div>
  );
}
