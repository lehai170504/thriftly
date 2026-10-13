'use client';

import { useFavoriteProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { Heart, HeartCrack, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { normalizePageResponse } from '@/lib/pagination';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState, ErrorState } from '@/components/patterns/state-panel';

export default function FavoritesPage() {
  const [page, setPage] = useState(0);
  const { data: productsPage, isLoading, error } = useFavoriteProducts(page, 12);

  const normalized = normalizePageResponse(productsPage);
  const products = normalized.content;
  const totalPages = normalized.totalPages;
  const totalElements = normalized.totalElements;

  return (
    <div className="page-container min-h-[70vh] space-y-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/profile">Tài khoản</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Yêu thích</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        title={<span className="flex items-center gap-3"><Heart className="size-7 text-destructive" aria-hidden="true" />Sản phẩm yêu thích</span>}
        description={totalElements > 0 ? `Bạn đang theo dõi ${totalElements} món đồ` : 'Danh sách những món đồ bạn đang quan tâm'}
      />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <ErrorState title="Không thể tải danh sách yêu thích" description="Vui lòng thử lại sau ít phút." />
      ) : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description="Bạn chưa thả tim sản phẩm nào. Hãy khám phá và lưu lại những món đồ bạn thích nhé!"
          icon={<HeartCrack className="size-9" />}
          action={<Link href="/products" className={buttonVariants()}>Khám phá ngay</Link>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Trang trước"
                shape="pill"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (i === 0 || i === totalPages - 1 || Math.abs(page - i) <= 1) {
                    return (
                      <Button
                        key={i}
                        variant={page === i ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(i)}
                        shape="pill"
                        aria-label={`Trang ${i + 1}`}
                      >
                        {i + 1}
                      </Button>
                    );
                  }
                  if (Math.abs(page - i) === 2) {
                    return <span key={i} className="text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                aria-label="Trang sau"
                shape="pill"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
