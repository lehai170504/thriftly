import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Gavel, Flame, Heart, Clock } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '@/features/products/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* eslint-disable @typescript-eslint/no-explicit-any */

function AuctionCountdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) return 'Đã kết thúc';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) return `${days} ngày ${hours} giờ`;
      if (hours > 0) return `${hours} giờ ${minutes} phút`;
      return `${minutes} phút`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return <span className="text-xs font-medium text-muted-foreground">Đang tính...</span>;
  if (timeLeft === 'Đã kết thúc') return <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{timeLeft}</span>;

  return (
    <div className="flex items-center gap-1 text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded uppercase tracking-wider">
      <Clock className="w-3.5 h-3.5" />
      {timeLeft}
    </div>
  );
}

export function ProductCard({ product }: { product: any }) {
  const imageUrl = product.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600&seed=${product.id}`;
  const secondaryImage = (product.images && product.images.length > 1) ? product.images[1] : imageUrl;
  const isBoosted = product.boostedUntil && new Date(product.boostedUntil) > new Date();

  const { data: favorites = [] } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { user, isAuthenticated } = useAuth();

  const isFavorited = favorites.includes(product.id);
  const isOwner = user?.id === product.sellerId || user?.username === product.sellerName;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm!');
      return;
    }
    toggleFavorite(product.id);
  };

  return (
    <Link href={`/products/${product.id}`} className="block group h-full">
      <Card className="overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 rounded-xl bg-card h-full cursor-pointer relative group/inner border-border/60">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&h=600&q=80';
            }}
          />
          <img
            src={secondaryImage}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&h=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              {isBoosted && (
                <Badge className="bg-background/95 text-amber-600 hover:bg-background shadow-sm border-none gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-md">
                  <Flame className="w-3 h-3" /> Nổi bật
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-1.5 items-end">
              {!isOwner && (
                <button
                  onClick={handleFavoriteClick}
                  className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-300 z-20 ${isFavorited ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-background/90 text-muted-foreground hover:bg-background hover:text-destructive'}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              )}

              {product.sellType === 'AUCTION' && !product.isLive && (
                <Badge className="bg-background/95 text-foreground hover:bg-background shadow-sm border-none gap-1 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md rounded-md">
                  <Gavel className="w-3 h-3 text-primary" /> Đấu giá
                </Badge>
              )}
              {product.isLive && (
                <Badge variant="destructive" className="border-none gap-1 px-2 py-0.5 text-[9px] font-black tracking-widest shadow-sm rounded-md neon-glow">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive-foreground"></span>
                  </span>
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </div>

        <CardHeader className="p-3 pb-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide">
              {product.categoryName || 'Đồ cũ'}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-border"></span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide">
              {product.condition === 'NEW' ? 'Mới 100%' : product.condition === 'LIKE_NEW' ? 'Như mới' : 'Đã sử dụng'}
            </span>
            {product.sellType === 'BUY_NOW' && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-border"></span>
                <span className="text-[10px] font-medium text-primary bg-primary/5 px-1 py-0.5 rounded tracking-wide">
                  Kho: {product.quantity || 1}
                </span>
              </>
            )}
          </div>
          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground group-hover/inner:text-primary transition-colors">
            {product.title}
          </h3>
        </CardHeader>

        <CardContent className="p-3 pt-1 flex-1 flex flex-col justify-end">
          {product.sellType === 'AUCTION' && (
            <div className="flex items-center justify-between mb-2 border-b border-border/50 pb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-muted-foreground uppercase font-medium tracking-wider">Thời gian còn lại</span>
                {product.auctionEndTime ? (
                  <AuctionCountdown endTime={product.auctionEndTime} />
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground">Chưa bắt đầu</span>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] text-muted-foreground uppercase font-medium tracking-wider">Lượt giá</span>
                <span className="text-[10px] font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded">{product.bidCount || 0}</span>
              </div>
            </div>
          )}

          <div className="flex items-end justify-between mt-auto pt-1">
            <div className="w-full">
              <div className="text-[10px] font-medium text-muted-foreground mb-0.5">
                {product.sellType === 'BUY_NOW' ? 'Giá bán' : (product.currentHighestBid && product.currentHighestBid > product.price ? 'Giá hiện tại' : 'Khởi điểm')}
              </div>
              <span className="text-base font-bold text-rose-500 tracking-tight transition-colors duration-300">
                {formatCurrency(product.sellType === 'AUCTION' && product.currentHighestBid && product.currentHighestBid > product.price ? product.currentHighestBid : product.price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
