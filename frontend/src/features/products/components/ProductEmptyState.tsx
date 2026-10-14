import { PackageSearch } from 'lucide-react';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';

export function ProductEmptyState() {
  return (
    <div className="text-center py-24 px-6 bg-card rounded-[28px] shadow-xs border border-border">
      <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
        <PackageSearch className="size-10" />
      </div>
      <h3 className="text-2xl font-heading font-bold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-muted-foreground font-medium text-base max-w-md mx-auto leading-relaxed">
        Thử thay đổi bộ lọc, nới rộng khoảng giá hoặc là người đầu tiên đăng bán sản phẩm tương tự!
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <CreateProductModal />
      </div>
    </div>
  );
}
