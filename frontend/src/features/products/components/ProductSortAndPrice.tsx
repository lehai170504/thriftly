import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface ProductSortAndPriceProps {
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  resetPage: () => void;
}

export function ProductSortAndPrice({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sort,
  setSort,
  resetPage
}: ProductSortAndPriceProps) {
  return (
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
            resetPage();
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
        <Select value={sort} onValueChange={(val) => { setSort(val || 'createdAt_desc'); resetPage(); }}>
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
  );
}
