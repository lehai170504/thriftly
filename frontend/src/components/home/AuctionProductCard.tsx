import type { ComponentProps } from "react";
import { MarketplaceProductCard } from "@/features/products/components/MarketplaceProductCard";

function AuctionProductCard({ product }: Pick<ComponentProps<typeof MarketplaceProductCard>, "product">) {
  return <MarketplaceProductCard product={product} variant="auction" />;
}

export { AuctionProductCard };
