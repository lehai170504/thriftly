import type { Product } from "@/features/products/types/product";
import { MarketplaceProductCard } from "@/features/products/components/MarketplaceProductCard";

function ProductCard({ product }: { product: Product }) {
  return <MarketplaceProductCard product={product} variant="standard" />;
}

export { ProductCard };
