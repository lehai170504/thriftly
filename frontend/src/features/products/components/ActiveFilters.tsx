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
      <span className="text-xs font-semibold text-muted-foreground mr-1">Đang lọc theo:</span>

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
          <Badge key={id} variant="secondary" className="pl-2.5 pr-1 py-1 rounded-full gap-1 border-border bg-card text-foreground font-medium text-xs shadow-2xs">
            {catName}
            <button onClick={() => { setCategoryIds(prev => prev.filter(c => c !== id)); resetPage(); }} className="hover:bg-muted rounded-full p-0.5 transition-colors ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        );
      })}

      {location && (
        <Badge variant="secondary" className="pl-2.5 pr-1 py-1 rounded-full gap-1 border-border bg-card text-foreground text-xs shadow-2xs">
          Khu vực: {location.split(',').pop()?.trim()}
          <button onClick={() => { setLocation(''); resetPage(); }} className="hover:bg-muted rounded-full p-0.5 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {sellType !== 'all' && (
        <Badge variant="secondary" className="pl-2.5 pr-1 py-1 rounded-full gap-1 border-border bg-card text-foreground text-xs shadow-2xs">
          {sellType === 'BUY_NOW' ? 'Mua ngay' : 'Đấu giá'}
          <button onClick={() => { setSellType('all'); resetPage(); }} className="hover:bg-muted rounded-full p-0.5 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {condition !== 'all' && (
        <Badge variant="secondary" className="pl-2.5 pr-1 py-1 rounded-full gap-1 border-border bg-card text-foreground text-xs shadow-2xs">
          {condition === 'NEW' ? 'Mới 100%' : condition === 'LIKE_NEW' ? 'Như mới' : condition === 'GOOD' ? 'Tốt' : 'Khá'}
          <button onClick={() => { setCondition('all'); resetPage(); }} className="hover:bg-muted rounded-full p-0.5 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {(minPrice || maxPrice) && (
        <Badge variant="secondary" className="pl-2.5 pr-1 py-1 rounded-full gap-1 border-border bg-card text-foreground text-xs shadow-2xs">
          Giá: {minPrice ? `${Number(minPrice).toLocaleString('vi-VN')}đ` : '0đ'} - {maxPrice ? `${Number(maxPrice).toLocaleString('vi-VN')}đ` : 'Trở lên'}
          <button onClick={() => { setMinPrice(''); setMaxPrice(''); resetPage(); }} className="hover:bg-muted rounded-full p-0.5 transition-colors">
            <X className="w-3 h-3" />
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
        className="text-xs text-primary hover:bg-primary/10 ml-1 h-7 rounded-full px-2.5 font-medium"
      >
        Xóa tất cả
      </Button>
    </div>
  );
}
