"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Gavel, Heart, MapPin } from "lucide-react";
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
  const { user, isAuthenticated, openAuthPrompt } = useAuth();
  const isFavorited = favorites.includes(product.id);
  const isOwner = user?.id === product.sellerId || user?.username === product.sellerName;

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      openAuthPrompt({
        title: 'Đăng nhập để lưu yêu thích',
        description: 'Lưu sản phẩm vào danh sách yêu thích giúp bạn dễ dàng theo dõi và nhận thông báo khi có ưu đãi.',
      });
      return;
    }
    toggleFavorite(product.id);
  };

  const conditionLabel = product.condition === "NEW" ? "Mới 100%" : product.condition === "LIKE_NEW" ? "Như mới" : product.condition === "GOOD" ? "Tốt" : product.condition === "FAIR" ? "Khá" : "Đã sử dụng";

  return (
    <Link href={href} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card variant="interactive" className="h-full cursor-pointer gap-0 py-0 overflow-hidden rounded-xl border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-border/80 hover:shadow-surface">
        <div className="relative aspect-square overflow-hidden bg-muted isolate [transform:translateZ(0)]">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-105 [backface-visibility:hidden]"
            onError={(event) => { event.currentTarget.src = fallbackImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {isBoosted && <Badge tone="warning" className="text-[11px] px-2 py-0.5"><Flame className="size-3 mr-0.5" />Nổi bật</Badge>}
              {product.isLive ? (
                <Badge tone="live" className="text-[11px] px-2 py-0.5"><span className="size-1.5 rounded-full bg-current animate-pulse mr-1" />Live</Badge>
              ) : isAuction ? (
                <Badge tone="brand" className="text-[11px] px-2 py-0.5"><Gavel className="size-3 mr-0.5" />Đấu giá</Badge>
              ) : null}
            </div>
            {!isOwner && (
              <Button
                variant="secondary"
                size="icon"
                shape="pill"
                aria-label={isFavorited ? `Bỏ lưu ${product.title}` : `Lưu ${product.title}`}
                aria-pressed={isFavorited}
                onClick={handleFavorite}
                className="size-8 bg-background/90 hover:bg-background border border-border/50 text-foreground shadow-xs shrink-0"
              >
                <Heart className={cn("size-4", isFavorited && "fill-destructive text-destructive")} />
              </Button>
            )}
          </div>

          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/95">
            <span className="bg-black/50 backdrop-blur-[2px] px-2 py-0.5 rounded-md border border-white/10 whitespace-nowrap shrink-0">
              {conditionLabel}
            </span>
            {product.location && (
              <span className="flex items-center gap-0.5 bg-black/50 backdrop-blur-[2px] px-1.5 py-0.5 rounded-md border border-white/10 truncate max-w-[120px] whitespace-nowrap">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{product.location}</span>
              </span>
            )}
          </div>
        </div>

        <CardHeader className="space-y-1.5 p-3.5 pb-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{product.categoryName || "Đồ cũ"}</span>
            {product.sellerName && (
              <span className="text-[11px] text-muted-foreground/80 truncate max-w-[100px]">@{product.sellerName}</span>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end gap-2 p-3.5 pt-1">
          {variant === "featured" && product.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
          )}
          {isAuction && (
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 text-xs">
              <span className={cn("flex items-center gap-1 font-numeric font-semibold text-[11px]", isExpired ? "text-destructive" : "text-foreground")}>
                <Clock className="size-3" />{timeLeft}
              </span>
              <span className="text-muted-foreground text-[11px]">
                <NumberText value={product.bidCount ?? 0} className="font-semibold text-foreground" /> lượt giá
              </span>
            </div>
          )}
          <div className="pt-0.5">
            <div className="text-[11px] text-muted-foreground mb-0.5">
              {isAuction ? (product.currentHighestBid ? "Giá cao nhất" : "Giá khởi điểm") : "Giá bán"}
            </div>
            <Money value={currentPrice} className="text-lg font-bold text-foreground tabular-nums tracking-tight" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export { MarketplaceProductCard };
export type { MarketplaceProductCardProps };
