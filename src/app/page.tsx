import { Container } from "@/components/ui/Container";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { BannerCarousel } from "@/components/shop/BannerCarousel";
import { InfoBanner } from "@/components/shop/InfoBanner";
import { StackedBanners } from "@/components/shop/StackedBanners";
import { ProductRow } from "@/components/shop/ProductRow";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";
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
  title: "Vink | Especialistas em Branding e Embalagens",
  description: "A Vink é sua parceira estratégica para branding, embalagens e impressos de alta qualidade. Soluções completas para potencializar a sua marca.",
  alternates: {
    canonical: 'https://vink.com.br',
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
  "name": "Vink",
  "image": "https://vink.com.br/icon.png",
  "@id": "https://vink.com.br",
  "url": "https://vink.com.br",
  "telephone": "+5531989880161",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços Gráficos e de Branding",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Branding e Design"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Embalagens Personalizadas"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Impressão Digital Premium"
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
          <div key={section.id}>
            <BannerCarousel banners={section.banners || []} />
          </div>
        );
      case 'info-banner':
        return <InfoBanner key={section.id} items={section.benefits} />;
      case 'categories':
        return (
          <Container key={section.id} className="mt-8">
            {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
            <CategoryNav activeCategory="todos" />
          </Container>
        );
      case 'product-row':
        return (
          <div key={section.id} className="mt-8">
            <ProductRow
              title={section.title || section.name}
              filter={section.settings?.filter || 'best-sellers'}
              productIds={section.settings?.productIds}
              preloadedProducts={productsMap[section.id] || []}
            />
          </div>
        );
      case 'stacked-banners':
        return <div key={section.id} className="mt-8"><StackedBanners banners={section.banners || []} /></div>;
      case 'blog-preview':
        return <div key={section.id} className="mt-8"><BlogPreviewSection title={section.title} postIds={section.settings?.postIds} /></div>;
      default:
        return null;
    }
  };

  const bannerSection = config.sections.find(s => s.type === 'banner-carousel' && s.enabled);
  const infoBannerSection = config.sections.find(s => s.type === 'info-banner' && s.enabled);

  const otherSections = config.sections.filter(s =>
    s.enabled &&
    s.id !== bannerSection?.id &&
    s.id !== infoBannerSection?.id
  );

  return (
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Main Banner (if exists) */}
      {bannerSection && renderSection(bannerSection)}

      {/* 2. Info Banner — colada no banner, sem gap */}
      {infoBannerSection && renderSection(infoBannerSection)}

      {/* 3. Dynamic Sections */}
      {otherSections.map(section => renderSection(section))}

      <WhatsAppButton />
    </div>
  );
}
