import { useState } from 'react';
import { Star, MapPin, Tag, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/features/products/types/product';
import { ReportProductModal } from './ReportProductModal';

interface ProductMainInfoProps {
  product: Product;
}

export function ProductMainInfo({ product }: ProductMainInfoProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-foreground leading-tight mb-4">
        {product.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium text-foreground">{product.averageRating?.toFixed(1) || '5.0'}</span>
        </div>
        <div className="w-[1px] h-4 bg-border" />
        <div>Đã bán <span className="font-medium text-foreground">{product.soldCount || 0}</span></div>
        <div className="w-[1px] h-4 bg-border" />
        <div
          className="flex items-center gap-1 text-primary cursor-pointer hover:underline"
          onClick={() => setIsReportModalOpen(true)}
        >
          Tố cáo sản phẩm
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 mb-6">
        <div className="text-sm text-muted-foreground mb-1">
          {product.sellType === 'BUY_NOW' ? 'Giá bán' : (product.currentHighestBid && product.currentHighestBid > product.price ? 'Giá đấu hiện tại' : 'Giá khởi điểm')}
        </div>
        <div className="text-3xl font-bold text-primary">
          {formatCurrency(product.sellType === 'AUCTION' && product.currentHighestBid && product.currentHighestBid > product.price ? product.currentHighestBid : product.price)}
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Vận chuyển từ:</span>
          <span className="font-medium truncate">{product.location || 'Chưa cập nhật'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Tình trạng:</span>
          <span className="font-medium whitespace-nowrap truncate">{product.condition === 'NEW' ? 'Mới 100%' : product.condition === 'LIKE_NEW' ? 'Như mới' : product.condition === 'GOOD' ? 'Tốt' : product.condition === 'FAIR' ? 'Khá' : 'Đã sử dụng'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Ngày đăng:</span>
          <span className="font-medium truncate">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs rounded-md font-normal truncate max-w-full">
            {product.categoryName}
          </Badge>
        </div>
      </div>

      <ReportProductModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        productId={product.id}
      />
    </>
  );
}
