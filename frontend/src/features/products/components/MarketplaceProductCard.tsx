"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Gavel, Heart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Money, NumberText } from "@/components/ui/typography";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites, useToggleFavorite } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types/product";
import { cn } from "@/lib/utils";

type MarketplaceProduct = Pick<Product, "id" | "title" | "price"> & Partial<Product>;
type MarketplaceProductCardProps = {
  product: MarketplaceProduct;
  variant?: "standard" | "auction" | "featured";
};

const fallbackImage = "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&h=600&q=80";

function useAuctionCountdown(endTime?: string) {
  const [timeLeft, setTimeLeft] = useState("Chưa bắt đầu");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const difference = new Date(endTime).getTime() - Date.now();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Đã kết thúc");
        return;
      }
      const days = Math.floor(difference / 86_400_000);
      const hours = Math.floor((difference % 86_400_000) / 3_600_000);
      const minutes = Math.floor((difference % 3_600_000) / 60_000);
      setTimeLeft(days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ ${minutes} phút`);
    };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [endTime]);

  return { timeLeft, isExpired };
}

function MarketplaceProductCard({ product, variant = "standard" }: MarketplaceProductCardProps) {
  const isAuction = variant === "auction" || product.sellType === "AUCTION";
  const href = variant === "auction" ? `/auctions/${product.id}` : `/products/${product.id}`;
  const imageUrl = product.imageUrl || product.images?.[0] || fallbackImage;
  const currentPrice = isAuction && product.currentHighestBid && product.currentHighestBid > product.price ? product.currentHighestBid : product.price;
  const isBoosted = Boolean(product.boostedUntil && new Date(product.boostedUntil) > new Date());
  const { timeLeft, isExpired } = useAuctionCountdown(product.auctionEndTime);
  const { data: favorites = [] } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { user, isAuthenticated } = useAuth();
  const isFavorited = favorites.includes(product.id);
  const isOwner = user?.id === product.sellerId || user?.username === product.sellerName;

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm.");
      return;
    }
    toggleFavorite(product.id);
  };

  const conditionLabel = product.condition === "NEW" ? "Mới 100%" : product.condition === "LIKE_NEW" ? "Như mới" : "Đã sử dụng";

  return (
    <Link href={href} className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card variant="interactive" className="h-full cursor-pointer gap-0 py-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {isBoosted && <Badge tone="warning"><Flame />Nổi bật</Badge>}
              {product.isLive ? <Badge tone="live"><span className="size-1.5 rounded-full bg-current animate-pulse" />Live</Badge> : isAuction && <Badge tone="brand"><Gavel />Đấu giá</Badge>}
            </div>
            {!isOwner && (
              <Button variant="glass" size="icon" shape="pill" aria-label={isFavorited ? `Bỏ lưu ${product.title}` : `Lưu ${product.title}`} aria-pressed={isFavorited} onClick={handleFavorite} className="size-11 bg-background/90">
                <Heart className={cn(isFavorited && "fill-destructive text-destructive")} />
              </Button>
            )}
          </div>
        </div>

        <CardHeader className="space-y-2 p-4 pb-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{product.categoryName || "Đồ cũ"}</span><span aria-hidden="true">•</span><span>{conditionLabel}</span>
          </div>
          <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-foreground transition-colors group-hover:text-primary">{product.title}</h3>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end gap-3 p-4 pt-1">
          {variant === "featured" && product.description && <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
          {isAuction && (
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3 text-xs">
              <span className={cn("flex items-center gap-1.5 font-numeric font-semibold", isExpired ? "text-destructive" : "text-foreground")}><Clock className="size-3.5" />{timeLeft}</span>
              <span className="text-muted-foreground"><NumberText value={product.bidCount ?? 0} className="font-semibold text-foreground" /> lượt giá</span>
            </div>
          )}
          <div>
            <p className="mb-1 text-xs text-muted-foreground">{isAuction ? (product.currentHighestBid ? "Giá hiện tại" : "Giá khởi điểm") : "Giá bán"}</p>
            <Money value={currentPrice} className="text-xl font-bold text-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export { MarketplaceProductCard };
export type { MarketplaceProductCardProps };
