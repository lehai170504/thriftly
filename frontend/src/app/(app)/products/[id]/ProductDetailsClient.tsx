/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/features/products/hooks/useProducts';
import { RelatedProducts } from '@/features/products/components/RelatedProducts';
import { ProductReviews } from '@/features/reviews/components/ProductReviews';
import { SellerInfoCard } from '@/features/products/components/SellerInfoCard';
import { ProductGallery } from '@/features/products/components/ProductGallery';
import { ProductMainInfo } from '@/features/products/components/ProductMainInfo';
import { ProductActionPanel } from '@/features/products/components/ProductActionPanel';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProductDetailSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorState } from '@/components/patterns/state-panel';

export default function ProductDetailsClient() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="page-container py-24">
        <ErrorState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm này có thể đã bị xóa hoặc không tồn tại."
          onRetry={() => window.location.reload()}
        />
        <div className="mt-4 flex justify-center">
          <Link href="/products" className={buttonVariants({ variant: 'outline' })}><ArrowLeft className="mr-2 size-4" />Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const isSeller = user?.id === product.sellerId || user?.username === product.sellerName;

  return (
    <div className="min-h-screen bg-muted/20 pb-24 dark:bg-background">
      <div className="page-container py-6">
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">{product.title}</span>
        </div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-surface border border-border p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            <ProductGallery product={product} />

            <div className="lg:col-span-7 flex flex-col">
              <ProductMainInfo product={product} />
              <ProductActionPanel product={product} user={user} isSeller={isSeller} />
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-surface border border-border p-6 mb-6">
          <SellerInfoCard
            sellerName={product.sellerName}
            sellerId={product.sellerId}
            sellerAvatar={product.sellerAvatar}
            isSeller={isSeller}
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              imageUrl: product.images?.[0] || product.imageUrl
            }}
          />
        </div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-surface border border-border p-6 md:p-8 mb-6">
          <div className="bg-muted px-4 py-3 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-foreground">Chi tiết sản phẩm</h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-4xl">
            {product.description || 'Không có mô tả cho sản phẩm này.'}
          </div>
        </div>

        {product.sellerName && (
          <div id="reviews-section" className="mb-6">
            <ProductReviews sellerName={product.sellerName} sellerAvatar={product.sellerAvatar} />
          </div>
        )}

        {product.categoryId && (
          <div className="mb-6">
            <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
}
