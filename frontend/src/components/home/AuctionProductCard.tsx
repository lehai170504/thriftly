import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Gavel, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AuctionProductCard({ product }: { product: any }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!product.auctionEndTime) return;

    const calculateTimeLeft = () => {
      const end = new Date(product.auctionEndTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Đã kết thúc');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [product.auctionEndTime]);

  const imageUrl = product.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600&seed=${product.id}`;
  const secondaryImage = (product.images && product.images.length > 1) ? product.images[1] : imageUrl;

  return (
    <Link href={`/auctions/${product.id}`} className="block group h-full">
      <Card className="overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-500 rounded-[24px] bg-background h-full cursor-pointer relative group/inner border-border/50">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&h=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          {product.isLive && (
            <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 shadow-sm border-none gap-1.5 px-3 py-1.5 text-sm backdrop-blur-md rounded-full z-10 neon-glow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> LIVE
            </Badge>
          )}
          {!product.isLive && (
            <Badge className="absolute top-4 right-4 bg-primary/95 hover:bg-primary/90 shadow-sm border-none gap-1.5 px-3 py-1.5 text-sm backdrop-blur-md rounded-full z-10">
              <Gavel className="w-4 h-4" /> Đấu giá
            </Badge>
          )}
        </div>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
              {product.categoryName || 'Đồ cũ'}
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {product.condition === 'NEW' ? 'Mới 100%' : product.condition === 'LIKE_NEW' ? 'Như mới' : 'Đã sử dụng'}
              </div>
            </div>
          </div>
          <h3 className="font-heading font-semibold text-lg line-clamp-1 text-foreground group-hover/inner:text-primary transition-colors mt-1">
            {product.title}
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
          <div>
            <div className={`text-xs font-bold mb-3 flex items-center gap-2 ${isExpired ? 'text-red-500' : 'text-primary'
              }`}>
              <Clock className={`w-4 h-4 ${isExpired ? '' : 'animate-pulse'}`} />
              {isExpired ? 'Đã kết thúc' : `Còn lại: ${timeLeft}`}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                {product.currentHighestBid && product.currentHighestBid > product.price
                  ? 'Giá hiện tại'
                  : 'Giá khởi điểm'}
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight group-hover/inner:text-primary transition-colors duration-300">
                {formatCurrency(product.currentHighestBid && product.currentHighestBid > product.price ? product.currentHighestBid : product.price)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
              <Gavel className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <span className="text-primary font-bold">{product.bidCount || 0}</span> người đã đặt giá
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
