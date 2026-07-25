/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import { useSearchProducts, useCategories } from '@/features/products/hooks/useProducts';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { useState, useEffect, Suspense } from 'react';

import { ProductCard } from '@/features/products/components/ProductCard';
import { useProfile } from '@/features/users/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { motion } from 'framer-motion';

import { ProductSidebar } from '@/features/products/components/ProductSidebar';
import { ActiveFilters } from '@/features/products/components/ActiveFilters';
import { ProductSortAndPrice } from '@/features/products/components/ProductSortAndPrice';
import { ProductPagination } from '@/features/products/components/ProductPagination';
import { ProductEmptyState } from '@/features/products/components/ProductEmptyState';

function ProductsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const initialSellType = searchParams.get('sellType') || 'all';
  const initialCategory = searchParams.get('category');
  const initialSort = searchParams.get('sort') || 'createdAt_desc';

  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [condition, setCondition] = useState<string>('all');
  const [sellType, setSellType] = useState<string>(initialSellType);
  const [location, setLocation] = useState<string>('');
  const [sort, setSort] = useState<string>(initialSort);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  const resetPage = () => setPage(0);

  useEffect(() => {
    const newCategory = searchParams.get('category');
    const newSort = searchParams.get('sort');
    const newSellType = searchParams.get('sellType');

    if (newCategory !== null) {
      setCategoryIds([newCategory]);
      setPage(0);
    }
    if (newSort !== null) {
      setSort(newSort);
      setPage(0);
    }
    if (newSellType !== null) {
      setSellType(newSellType);
      setPage(0);
    }
  }, [searchParams]);

  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile(isAuthenticated);
  const { data: categories } = useCategories();

  const { data: productsPage, isLoading, error } = useSearchProducts({
    query: query || undefined,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    condition: condition !== 'all' ? condition : undefined,
    sellType: sellType !== 'all' ? sellType : undefined,
    location: location || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy: sort.split('_')[0],
    direction: sort.split('_')[1] as 'asc' | 'desc',
    page: page,
    size: 12
  });

  const products = productsPage?.content || [];
  const totalPages = productsPage?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground mb-4">
              {query ? (
                <>Kết quả cho <span className="italic text-primary">"{query}"</span></>
              ) : (
                <>Khám phá <span className="italic text-primary font-normal">Sản phẩm</span></>
              )}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Khám phá những món đồ cũ chất lượng với giá tốt nhất, được tuyển chọn dành riêng cho bạn.</p>
          </div>
          <div className="shrink-0">
            <CreateProductModal />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <ProductSidebar
            profile={profile}
            categories={categories || []}
            categoryIds={categoryIds}
            setCategoryIds={setCategoryIds}
            location={location}
            setLocation={setLocation}
            sellType={sellType}
            setSellType={setSellType}
            condition={condition}
            setCondition={setCondition}
            resetPage={resetPage}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Top Bar of Main Content: Active Filters & Sort */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border/50 pb-4">

              <div className="flex-1 min-w-0">
                <ActiveFilters
                  categories={categories || []}
                  categoryIds={categoryIds}
                  setCategoryIds={setCategoryIds}
                  location={location}
                  setLocation={setLocation}
                  sellType={sellType}
                  setSellType={setSellType}
                  condition={condition}
                  setCondition={setCondition}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  resetPage={resetPage}
                />
              </div>

              <ProductSortAndPrice
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sort={sort}
                setSort={setSort}
                resetPage={resetPage}
              />
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : error ? (
              <div className="text-center py-20 bg-background/50 glass rounded-2xl shadow-sm border border-border">
                <p className="text-red-500 font-medium text-lg">Không thể tải danh sách sản phẩm lúc này. Vui lòng thử lại sau.</p>
              </div>
            ) : products?.length === 0 ? (
              <ProductEmptyState />
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              >
                {products?.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                    whileHover={{ y: -8 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <ProductPagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}