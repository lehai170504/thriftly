import { useRelatedProducts } from '@/features/products/hooks/useProducts';
import { MarketplaceProductCard } from './MarketplaceProductCard';

export function RelatedProducts({ categoryId, currentProductId }: { categoryId: string, currentProductId: string }) {
  const { data: relatedProducts, isLoading } = useRelatedProducts(currentProductId, categoryId);

  if (isLoading || !relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {relatedProducts.map((product: any) => (
          <div key={product.id} className="h-full">
            <MarketplaceProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
