/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import { useSearchProducts, useCategories } from '@/features/products/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { CategoryIcon } from '@/components/ui/category-icon';
import { ShoppingBag, Filter, ChevronLeft, ChevronRight, Star, MapPin, X } from 'lucide-react';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { useState, useEffect, Suspense } from 'react';

import { ProductCard } from '@/features/products/components/ProductCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocationSelector } from '@/components/ui/LocationSelector';
import { useProfile } from '@/features/users/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { motion } from 'framer-motion';

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
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<string>('');

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

  const hasActiveFilters = categoryIds.length > 0 || condition !== 'all' || sellType !== 'all' || location !== '';

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
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0">
            <div className="sticky top-[80px] bg-background/50 border border-border/50 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-lg font-bold border-b border-border/50 pb-4 mb-6">
                <Filter className="w-5 h-5" /> Bộ lọc tìm kiếm
              </div>

              {/* Gợi ý cho bạn */}
              {profile?.interests && profile.interests.filter((id: string) => !categoryIds.includes(id)).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" /> Gợi ý
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.filter((id: string) => !categoryIds.includes(id)).map((interestId: string) => {
                      const cat = categories?.find(c => c.id === interestId);
                      if (!cat) return null;
                      return (
                        <button
                          key={interestId}
                          onClick={() => { setCategoryIds(prev => [...prev, interestId]); setPage(0); }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-all text-xs font-medium glass border-border text-primary hover:bg-primary/10"
                        >
                          <CategoryIcon name={cat.icon} className="w-3 h-3" /> {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Danh mục */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Danh mục</h3>
                  <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <button onClick={() => { setCategoryIds([]); setPage(0); }} className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryIds.length === 0 ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'}`}>
                      Tất cả danh mục
                    </button>
                    {categories?.map((c) => (
                      <div key={c.id} className="flex flex-col mb-1">
                        <button onClick={() => {
                          if (categoryIds.includes(c.id)) { setCategoryIds([]); } else { setCategoryIds([c.id]); }
                          setPage(0);
                        }} className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryIds.includes(c.id) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'}`}>
                          {c.name}
                        </button>
                        {c.subCategories && c.subCategories.length > 0 && (
                          <div className="flex flex-col ml-3 border-l-2 border-border/40 pl-2 mt-1 mb-1 gap-0.5">
                            {c.subCategories.map((sub: any) => (
                              <button key={sub.id} onClick={() => {
                                if (categoryIds.includes(sub.id)) { setCategoryIds([]); } else { setCategoryIds([sub.id]); }
                                setPage(0);
                              }} className={`text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${categoryIds.includes(sub.id) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Khu vực */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Khu vực</h3>
                  <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                    <Button variant="outline" className="w-full justify-between font-medium bg-background border-border/60 rounded-xl hover:bg-muted/50 transition-all h-10 px-3" onClick={() => setIsLocationDialogOpen(true)}>
                      <span className="line-clamp-1 text-left">
                        {location ? location.split(',').pop()?.trim() : 'Tất cả khu vực'}
                      </span>
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
                    </Button>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                      <DialogHeader><DialogTitle>Chọn khu vực</DialogTitle></DialogHeader>
                      <div className="py-4"><LocationSelector value={tempLocation} onChange={setTempLocation} mode="full" /></div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" className="rounded-full" onClick={() => { setTempLocation(''); setLocation(''); setIsLocationDialogOpen(false); setPage(0); }}>Xóa lọc</Button>
                        <Button className="rounded-full" onClick={() => { setLocation(tempLocation); setIsLocationDialogOpen(false); setPage(0); }}>Áp dụng</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Hình thức */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Hình thức bán</h3>
                  <Select value={sellType} onValueChange={(val) => { setSellType(val || 'all'); setPage(0); }}>
                    <SelectTrigger className="w-full bg-background border-border/60 font-medium rounded-xl hover:bg-muted/50 transition-all h-10 px-3">
                      <span className="line-clamp-1 text-left">
                        {sellType === 'all' ? 'Tất cả hình thức' : sellType === 'BUY_NOW' ? 'Mua ngay' : 'Đấu giá'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="all">Tất cả hình thức</SelectItem>
                      <SelectItem value="BUY_NOW">Mua ngay</SelectItem>
                      <SelectItem value="AUCTION">Đấu giá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tình trạng */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Tình trạng</h3>
                  <Select value={condition} onValueChange={(val) => { setCondition(val || 'all'); setPage(0); }}>
                    <SelectTrigger className="w-full bg-background border-border/60 font-medium rounded-xl hover:bg-muted/50 transition-all h-10 px-3">
                      <span className="line-clamp-1 text-left">
                        {condition === 'all' ? 'Tất cả tình trạng' : condition === 'NEW' ? 'Mới 100%' : condition === 'LIKE_NEW' ? 'Như mới' : condition === 'GOOD' ? 'Tốt' : 'Khá'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="all">Tất cả tình trạng</SelectItem>
                      <SelectItem value="NEW">Mới 100%</SelectItem>
                      <SelectItem value="LIKE_NEW">Như mới</SelectItem>
                      <SelectItem value="GOOD">Tốt</SelectItem>
                      <SelectItem value="FAIR">Khá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Top Bar of Main Content: Active Filters & Sort */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border/50 pb-4">

              {/* Active Filter Chips */}
              <div className="flex-1 min-w-0">
                {hasActiveFilters ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground mr-2">Đang lọc theo:</span>

                    {/* Category Chips */}
                    {categoryIds.map(id => {
                      let catName = 'Danh mục';
                      for (const c of categories || []) {
                        if (c.id === id) { catName = c.name; break; }
                        if (c.subCategories) {
                          const sub = c.subCategories.find((s: any) => s.id === id);
                          if (sub) { catName = sub.name; break; }
                        }
                      }
                      return (
                        <Badge key={id} variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground font-medium">
                          {catName}
                          <button onClick={() => { setCategoryIds(prev => prev.filter(c => c !== id)); setPage(0); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      );
                    })}

                    {/* Location Chip */}
                    {location && (
                      <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
                        Khu vực: {location.split(',').pop()?.trim()}
                        <button onClick={() => { setLocation(''); setTempLocation(''); setPage(0); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}

                    {/* SellType Chip */}
                    {sellType !== 'all' && (
                      <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
                        {sellType === 'BUY_NOW' ? 'Mua ngay' : 'Đấu giá'}
                        <button onClick={() => { setSellType('all'); setPage(0); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}

                    {/* Condition Chip */}
                    {condition !== 'all' && (
                      <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
                        {condition === 'NEW' ? 'Mới 100%' : condition === 'LIKE_NEW' ? 'Như mới' : condition === 'GOOD' ? 'Tốt' : 'Khá'}
                        <button onClick={() => { setCondition('all'); setPage(0); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}

                    {/* Price Range Chip */}
                    {(minPrice || maxPrice) && (
                      <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
                        Giá: {minPrice ? `${Number(minPrice).toLocaleString('vi-VN')}đ` : '0đ'} - {maxPrice ? `${Number(maxPrice).toLocaleString('vi-VN')}đ` : 'Trở lên'}
                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(0); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryIds([]);
                        setCondition('all');
                        setSellType('all');
                        setLocation('');
                        setTempLocation('');
                        setMinPrice('');
                        setMaxPrice('');
                        setPage(0);
                      }}
                      className="text-xs text-primary hover:bg-primary/10 ml-2 h-7 rounded-full"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">Tất cả sản phẩm hiện có</span>
                )}
              </div>

              {/* Bộ lọc khoảng giá & Sắp xếp */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Giá:</span>
                  <Select
                    value={
                      (!minPrice && !maxPrice) ? 'all' :
                        (!minPrice && maxPrice === '500000') ? 'under_500k' :
                          (minPrice === '500000' && maxPrice === '2000000') ? '500k_2m' :
                            (minPrice === '2000000' && maxPrice === '5000000') ? '2m_5m' :
                              (minPrice === '5000000' && !maxPrice) ? 'over_5m' : 'custom'
                    }
                    onValueChange={(val) => {
                      if (val === 'all') { setMinPrice(''); setMaxPrice(''); }
                      else if (val === 'under_500k') { setMinPrice(''); setMaxPrice('500000'); }
                      else if (val === '500k_2m') { setMinPrice('500000'); setMaxPrice('2000000'); }
                      else if (val === '2m_5m') { setMinPrice('2000000'); setMaxPrice('5000000'); }
                      else if (val === 'over_5m') { setMinPrice('5000000'); setMaxPrice(''); }
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="h-10 px-4 w-[140px] sm:w-[170px] bg-background font-medium border-border/60 rounded-full hover:bg-muted/50 transition-all shadow-sm">
                      <span className="line-clamp-1 text-left">
                        {(!minPrice && !maxPrice) ? 'Mọi mức giá' :
                          (!minPrice && maxPrice === '500000') ? 'Dưới 500.000đ' :
                            (minPrice === '500000' && maxPrice === '2000000') ? '500k - 2 triệu' :
                              (minPrice === '2000000' && maxPrice === '5000000') ? '2 - 5 triệu' :
                                (minPrice === '5000000' && !maxPrice) ? 'Trên 5 triệu' : 'Tùy chỉnh'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="all">Mọi mức giá</SelectItem>
                      <SelectItem value="under_500k">Dưới 500.000đ</SelectItem>
                      <SelectItem value="500k_2m">500.000đ - 2.000.000đ</SelectItem>
                      <SelectItem value="2m_5m">2.000.000đ - 5.000.000đ</SelectItem>
                      <SelectItem value="over_5m">Trên 5.000.000đ</SelectItem>
                      {(minPrice || maxPrice) &&
                        !['under_500k', '500k_2m', '2m_5m', 'over_5m'].includes(
                          (!minPrice && maxPrice === '500000') ? 'under_500k' :
                            (minPrice === '500000' && maxPrice === '2000000') ? '500k_2m' :
                              (minPrice === '2000000' && maxPrice === '5000000') ? '2m_5m' :
                                (minPrice === '5000000' && !maxPrice) ? 'over_5m' : ''
                        ) && (
                          <SelectItem value="custom">Tùy chỉnh</SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Sắp xếp:</span>
                  <Select value={sort} onValueChange={(val) => { setSort(val || 'createdAt_desc'); setPage(0); }}>
                    <SelectTrigger className="h-10 px-4 w-[160px] sm:w-[190px] bg-background font-medium border-border/60 rounded-full hover:bg-muted/50 transition-all shadow-sm">
                      <span className="line-clamp-1 text-left">
                        {sort === 'createdAt_desc' ? 'Mới nhất' : sort === 'price_asc' ? 'Giá: Thấp đến Cao' : 'Giá: Cao đến Thấp'}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="createdAt_desc">Mới nhất</SelectItem>
                      <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                      <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : error ? (
              <div className="text-center py-20 bg-background/50 glass rounded-2xl shadow-sm border border-border">
                <p className="text-red-500 font-medium text-lg">Không thể tải danh sách sản phẩm lúc này. Vui lòng thử lại sau.</p>
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-32 bg-background/50 glass rounded-3xl shadow-sm border border-border">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <div className="mt-8">
                  <CreateProductModal />
                </div>
              </div>
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

            {/* Pagination */}
            {products.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-full w-10 h-10 border-border text-foreground"
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
                          className={`w-10 h-10 rounded-full font-bold ${page === i ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
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
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="rounded-full w-10 h-10 border-border text-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
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