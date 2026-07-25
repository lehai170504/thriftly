import { Star, Filter, MapPin } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { LocationSelector } from '@/components/ui/LocationSelector';
import { useState, useEffect } from 'react';

interface ProductSidebarProps {
  profile: any;
  categories: any[];
  categoryIds: string[];
  setCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  location: string;
  setLocation: (loc: string) => void;
  sellType: string;
  setSellType: (type: string) => void;
  condition: string;
  setCondition: (cond: string) => void;
  resetPage: () => void;
  hideSellTypeFilter?: boolean;
}

export function ProductSidebar({
  profile,
  categories,
  categoryIds,
  setCategoryIds,
  location,
  setLocation,
  sellType,
  setSellType,
  condition,
  setCondition,
  resetPage,
  hideSellTypeFilter,
}: ProductSidebarProps) {
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<string>('');

  useEffect(() => {
    if (isLocationDialogOpen) {
      setTempLocation(location);
    }
  }, [isLocationDialogOpen, location]);

  return (
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
                    onClick={() => { setCategoryIds(prev => [...prev, interestId]); resetPage(); }}
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
              <button onClick={() => { setCategoryIds([]); resetPage(); }} className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryIds.length === 0 ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'}`}>
                Tất cả danh mục
              </button>
              {categories?.map((c) => (
                <div key={c.id} className="flex flex-col mb-1">
                  <button onClick={() => {
                    if (categoryIds.includes(c.id)) { setCategoryIds([]); } else { setCategoryIds([c.id]); }
                    resetPage();
                  }} className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${categoryIds.includes(c.id) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'}`}>
                    {c.name}
                  </button>
                  {c.subCategories && c.subCategories.length > 0 && (
                    <div className="flex flex-col ml-3 border-l-2 border-border/40 pl-2 mt-1 mb-1 gap-0.5">
                      {c.subCategories.map((sub: any) => (
                        <button key={sub.id} onClick={() => {
                          if (categoryIds.includes(sub.id)) { setCategoryIds([]); } else { setCategoryIds([sub.id]); }
                          resetPage();
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
                  <Button variant="outline" className="rounded-full" onClick={() => { setTempLocation(''); setLocation(''); setIsLocationDialogOpen(false); resetPage(); }}>Xóa lọc</Button>
                  <Button className="rounded-full" onClick={() => { setLocation(tempLocation); setIsLocationDialogOpen(false); resetPage(); }}>Áp dụng</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Hình thức */}
          {!hideSellTypeFilter && (
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Hình thức bán</h3>
              <Select value={sellType} onValueChange={(val) => { setSellType(val || 'all'); resetPage(); }}>
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
          )}

          {/* Tình trạng */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Tình trạng</h3>
            <Select value={condition} onValueChange={(val) => { setCondition(val || 'all'); resetPage(); }}>
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
  );
}
