'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearchProducts, useCategories } from '@/features/products/hooks/useProducts';
import { useActiveLiveAuctions } from '@/features/live/hooks/useLive';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { Gavel, Activity, Flame } from 'lucide-react';
import { useProfile } from '@/features/users/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

import { ProductSidebar } from '@/features/products/components/ProductSidebar';
import { ActiveFilters } from '@/features/products/components/ActiveFilters';
import { ProductSortAndPrice } from '@/features/products/components/ProductSortAndPrice';
import { ProductPagination } from '@/features/products/components/ProductPagination';
import { ProductEmptyState } from '@/features/products/components/ProductEmptyState';

function AuctionsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category');
  const initialSort = searchParams.get('sort') || 'createdAt_desc';

  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [condition, setCondition] = useState<string>('all');
  const [sellType, setSellType] = useState<string>('AUCTION');
  const [location, setLocation] = useState<string>('');
  const [sort, setSort] = useState<string>(initialSort);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  const resetPage = () => setPage(0);

  useEffect(() => {
    const newCategory = searchParams.get('category');
    const newSort = searchParams.get('sort');

    if (newCategory !== null) {
      setCategoryIds([newCategory]);
      setPage(0);
    }
    if (newSort !== null) {
      setSort(newSort);
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
    sellType: 'AUCTION',
    location: location || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy: sort.split('_')[0],
    direction: sort.split('_')[1] as 'asc' | 'desc',
    page: page,
    size: 12
  });

  const { data: activeLiveSessions } = useActiveLiveAuctions();

  const productsWithLiveStatus = useMemo(() => {
    if (!productsPage?.content) return [];
    return productsPage.content.map((product: any) => ({
      ...product,
      isLive: activeLiveSessions?.some((session: any) => session.productId === product.id) || false
    }));
  }, [productsPage?.content, activeLiveSessions]);

  const sortedProducts = useMemo(() => {
    if (sort !== 'createdAt_desc') return productsWithLiveStatus;
    return [...productsWithLiveStatus].sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return 0;
    });
  }, [productsWithLiveStatus, sort]);

  const totalPages = productsPage?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner */}
      <div className="relative w-full mb-8 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] border-b border-border bg-gradient-to-br from-background via-muted/30 to-background shadow-sm">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative container mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[13px] font-semibold mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Trực tiếp & Đấu giá
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight mb-3 flex items-center gap-3">
                <Gavel className="w-10 h-10 text-primary drop-shadow-sm" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Sàn Đấu Giá
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Nơi hội tụ những món đồ độc lạ, giới hạn. Hãy cạnh tranh minh bạch và đưa ra mức giá tốt nhất để trở thành người chiến thắng!
              </p>
            </div>

            <div className="flex gap-4 w-full md:w-auto z-10">
              <div className="glass bg-background/60 backdrop-blur-xl rounded-[24px] p-5 flex-1 md:flex-none md:w-40 border border-white/20 dark:border-white/10 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1 tracking-tight">24/7</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Liên tục hoạt động</div>
              </div>
              <div className="glass bg-background/60 backdrop-blur-xl rounded-[24px] p-5 flex-1 md:flex-none md:w-40 border border-white/20 dark:border-white/10 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-chart-2/10 flex items-center justify-center text-chart-2 mx-auto mb-3 group-hover:scale-110 group-hover:bg-chart-2 group-hover:text-white transition-all duration-300">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1 tracking-tight">HOT</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Phiên sôi động</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
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
            hideSellTypeFilter={true}
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
                <p className="text-red-500 font-medium text-lg">Không thể tải danh sách phiên đấu giá lúc này. Vui lòng thử lại sau.</p>
              </div>
            ) : sortedProducts.length === 0 ? (
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
                {sortedProducts.map((product: any) => (
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

export default function AuctionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Đang tải...</div>}>
      <AuctionsContent />
    </Suspense>
  );
}
