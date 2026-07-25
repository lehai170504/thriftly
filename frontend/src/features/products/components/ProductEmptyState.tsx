import { ShoppingBag } from 'lucide-react';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';

export function ProductEmptyState() {
  return (
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
  );
}
