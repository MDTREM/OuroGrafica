import { Container } from "@/components/ui/Container";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { BannerCarousel } from "@/components/shop/BannerCarousel";
import { InfoBanner } from "@/components/shop/InfoBanner";
import { StackedBanners } from "@/components/shop/StackedBanners";
import { ProductRow } from "@/components/shop/ProductRow";
import { CATEGORIES } from "@/data/mockData";
import { MaintenanceCTA } from "@/components/shop/MaintenanceCTA";
import { getHomepageConfig, Section } from "@/actions/homepage-actions";

export default async function Home() {
  const config = await getHomepageConfig();

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
        return (
          <ProductRow
            key={section.id}
            title={section.title || section.name}
            filter={section.settings?.filter || 'best-sellers'}
            productIds={section.settings?.productIds}
          />
        );
      case 'stacked-banners':
        return <StackedBanners key={section.id} banners={section.banners || []} />;
      default:
        return null;
    }
  };

  const bannerSection = config.sections.find(s => s.type === 'banner-carousel' && s.enabled);
  const otherSections = config.sections.filter(s => s.enabled && s.type !== 'banner-carousel');

  return (
    <div className="pb-8 space-y-8">
      {/* 1. Main Banner (if exists) */}
      {bannerSection && renderSection(bannerSection)}

      {/* 2. Static Maintenance CTA */}
      <MaintenanceCTA />

      {/* 3. Other Dynamic Sections */}
      {otherSections.map(section => renderSection(section))}
    </div>
  );
}
