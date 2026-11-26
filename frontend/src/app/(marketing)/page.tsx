import { LiveAuctionHero } from '@/components/home/LiveAuctionHero';
import { TrustIndicators } from '@/components/home/TrustIndicators';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowItWorks } from '@/components/home/HowItWorks';
import { InteractiveEscrow } from '@/components/home/InteractiveEscrow';
import { ProductCategories } from '@/components/home/ProductCategories';
import { WhyThriftly } from '@/components/home/WhyThriftly';
import { PlatformHighlights } from '@/components/home/PlatformHighlights';
import { FinalCta } from '@/components/home/FinalCta';

export default function Home() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground">
      <LiveAuctionHero />
      <TrustIndicators />
      <FeaturedProducts />
      <HowItWorks />
      <InteractiveEscrow />
      <ProductCategories />
      <WhyThriftly />
      <PlatformHighlights />
      <FinalCta />
    </div>
  );
}
