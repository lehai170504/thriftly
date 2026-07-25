import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  categories: any[];
  categoryIds: string[];
  setCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  location: string;
  setLocation: (loc: string) => void;
  sellType: string;
  setSellType: (type: string) => void;
  condition: string;
  setCondition: (cond: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  resetPage: () => void;
}

export function ActiveFilters({
  categories,
  categoryIds,
  setCategoryIds,
  location,
  setLocation,
  sellType,
  setSellType,
  condition,
  setCondition,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  resetPage,
}: ActiveFiltersProps) {
  const hasActiveFilters = categoryIds.length > 0 || condition !== 'all' || sellType !== 'all' || location !== '' || minPrice !== '' || maxPrice !== '';

  if (!hasActiveFilters) {
    return <span className="text-sm font-semibold text-muted-foreground">Tất cả sản phẩm hiện có</span>;
  }

  return (
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
            <button onClick={() => { setCategoryIds(prev => prev.filter(c => c !== id)); resetPage(); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </Badge>
        );
      })}

      {/* Location Chip */}
      {location && (
        <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
          Khu vực: {location.split(',').pop()?.trim()}
          <button onClick={() => { setLocation(''); resetPage(); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      )}

      {/* SellType Chip */}
      {sellType !== 'all' && (
        <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
          {sellType === 'BUY_NOW' ? 'Mua ngay' : 'Đấu giá'}
          <button onClick={() => { setSellType('all'); resetPage(); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      )}

      {/* Condition Chip */}
      {condition !== 'all' && (
        <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
          {condition === 'NEW' ? 'Mới 100%' : condition === 'LIKE_NEW' ? 'Như mới' : condition === 'GOOD' ? 'Tốt' : 'Khá'}
          <button onClick={() => { setCondition('all'); resetPage(); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      )}

      {/* Price Range Chip */}
      {(minPrice || maxPrice) && (
        <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-border glass text-foreground">
          Giá: {minPrice ? `${Number(minPrice).toLocaleString('vi-VN')}đ` : '0đ'} - {maxPrice ? `${Number(maxPrice).toLocaleString('vi-VN')}đ` : 'Trở lên'}
          <button onClick={() => { setMinPrice(''); setMaxPrice(''); resetPage(); }} className="hover:bg-secondary rounded-full p-0.5 transition-colors">
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
          setMinPrice('');
          setMaxPrice('');
          resetPage();
        }}
        className="text-xs text-primary hover:bg-primary/10 ml-2 h-7 rounded-full"
      >
        Xóa tất cả
      </Button>
    </div>
  );
}
