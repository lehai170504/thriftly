'use client';

import { useFavoriteProducts } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { Heart, HeartCrack, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { normalizePageResponse } from '@/lib/pagination';

export default function FavoritesPage() {
  const [page, setPage] = useState(0);
  const { data: productsPage, isLoading, error } = useFavoriteProducts(page, 12);

  const normalized = normalizePageResponse(productsPage);
  const products = normalized.content;
  const totalPages = normalized.totalPages;
  const totalElements = normalized.totalElements;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[70vh]">
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
      <div className="flex flex-col gap-2 pb-6 border-b border-border/40">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
          Sản phẩm Yêu thích
        </h1>
        <p className="text-muted-foreground">
          {totalElements > 0 ? `Bạn đang theo dõi ${totalElements} món đồ` : 'Danh sách những món đồ bạn đang quan tâm'}
        </p>
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <div className="text-center py-20 bg-background/50 rounded-3xl border border-border/50">
          <p className="text-red-500">Có lỗi xảy ra khi tải danh sách yêu thích.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-background/50 rounded-[2.5rem] border border-border/50 flex flex-col items-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Bạn chưa thả tim sản phẩm nào. Hãy khám phá và lưu lại những món đồ bạn thích nhé!
          </p>
          <Link href="/products">
            <Button className="rounded-full px-8">Khám phá ngay</Button>
          </Link>
        </div>
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
                className="rounded-full w-10 h-10 border-border"
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
                        className={`w-10 h-10 rounded-full font-bold ${page === i ? 'bg-primary text-white' : 'text-muted-foreground'
                          }`}
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
                className="rounded-full w-10 h-10 border-border"
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
