'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Gavel, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Money, NumberText } from '@/components/ui/typography';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { useProducts } from '@/features/products/hooks/useProducts';
import type { Product } from '@/features/products/types/product';
import { formatDateTime } from '@/lib/formatters';

interface DemoAuctionItem {
  id: string;
  title: string;
  categoryName: string;
  startingPrice: number;
  currentBid: number;
  bidCount: number;
  imageUrl: string;
  statusLabel: string;
  endNote: string;
}

const DEMO_AUCTIONS: DemoAuctionItem[] = [
  {
    id: 'demo-jacket',
    title: 'Áo khoác da dáng Vintage 1990s',
    categoryName: 'Thời trang Vintage',
    startingPrice: 1800000,
    currentBid: 2450000,
    bidCount: 14,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    statusLabel: 'Minh họa',
    endNote: 'Mẫu giao diện phiên đấu giá',
  },
  {
    id: 'demo-watch',
    title: 'Đồng hồ cơ cổ điển mặt số kem',
    categoryName: 'Phụ kiện',
    startingPrice: 3500000,
    currentBid: 4200000,
    bidCount: 9,
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80',
    statusLabel: 'Minh họa',
    endNote: 'Mẫu giao diện phiên đấu giá',
  },
  {
    id: 'demo-camera',
    title: 'Máy ảnh film Rangefinder ống kính 35mm',
    categoryName: 'Thiết bị điện tử',
    startingPrice: 4800000,
    currentBid: 5600000,
    bidCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80',
    statusLabel: 'Minh họa',
    endNote: 'Mẫu giao diện phiên đấu giá',
  },
  {
    id: 'demo-sneakers',
    title: 'Giày thể thao da lộn phối màu Retro',
    categoryName: 'Giày & Streetwear',
    startingPrice: 1500000,
    currentBid: 2100000,
    bidCount: 11,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
    statusLabel: 'Minh họa',
    endNote: 'Mẫu giao diện phiên đấu giá',
  },
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

function AuctionCountdownBadge({ endTime }: { endTime?: string }) {
  const [text, setText] = useState<string>('Đang cập nhật');

  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setText('Đã kết thúc');
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      setText(days > 0 ? `Còn ${days} ngày ${hours} giờ` : `Còn ${hours} giờ ${minutes} phút`);
    };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [endTime]);

  return <span>{text}</span>;
}

export function FeaturedProducts() {
  const { data, isLoading, isError } = useProducts(0, 12);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const liveAuctions = useMemo<Product[]>(() => {
    if (!data?.content || now === null) return [];
    return data.content
      .filter(
        (item) =>
          item.sellType === 'AUCTION' &&
          item.auctionEndTime &&
          new Date(item.auctionEndTime).getTime() > now
      )
      .slice(0, 4);
  }, [data, now]);

  const showDemo = !isLoading && (isError || liveAuctions.length === 0);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 space-y-3">
            <div className="w-36 h-4 bg-[#E5E0D7] dark:bg-muted animate-pulse rounded-full" />
            <div className="w-72 h-9 bg-[#E5E0D7] dark:bg-muted animate-pulse rounded-lg" />
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Đấu giá nổi bật
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight mb-3">
              Sức Hút Nằm Ở Từng Lượt Trả Giá.
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
              Theo dõi mức giá hiện tại, số lượt trả giá và thời gian kết thúc của các phiên đấu giá đang mở trên Thriftly.
            </p>
          </div>

          <Link href="/products?sellType=AUCTION" className="shrink-0">
            <Button
              variant="outline"
              className="rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/40 dark:hover:bg-accent h-11 px-5 text-sm font-medium group transition-all duration-200 active:scale-[0.98]"
            >
              Xem tất cả phiên đấu giá
              <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {showDemo && (
          <div className="mb-8 flex items-start sm:items-center gap-3 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border px-4 py-3 text-xs sm:text-sm text-[#77736D] dark:text-muted-foreground">
            <Info className="w-4 h-4 text-[#244C3A] dark:text-primary shrink-0 mt-0.5 sm:mt-0" />
            <p>
              Hiện chưa có phiên đấu giá trực tiếp nào từ hệ thống. Các thẻ bên dưới là{' '}
              <span className="font-semibold text-[#191919] dark:text-foreground">nội dung minh họa</span>{' '}
              giúp bạn hình dung bố cục phiên đấu giá trên Thriftly.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!showDemo
            ? liveAuctions.map((product, index) => {
                const currentBid =
                  product.currentHighestBid && product.currentHighestBid > product.price
                    ? product.currentHighestBid
                    : product.price;
                const hasHigherBid =
                  Boolean(product.currentHighestBid) &&
                  (product.currentHighestBid ?? 0) > product.price;

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: index * 0.06, ease: EDITORIAL_EASE }}
                    className="group editorial-card flex flex-col rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border overflow-hidden hover:border-[#244C3A]/40 dark:hover:border-primary/40 hover:shadow-elevated"
                  >
                    <Link href={`/auctions/${product.id}`} className="flex flex-col flex-1">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5E0D7]/30 dark:bg-muted">
                        <img
                          src={product.imageUrl || product.images?.[0] || FALLBACK_IMAGE}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-card/95 text-[#191919] dark:text-foreground text-[11px] font-semibold shadow-surface">
                            <span className="size-1.5 rounded-full bg-[#244C3A] dark:bg-primary animate-pulse" />
                            {product.isLive ? 'Trực tiếp' : 'Đang diễn ra'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-5">
                        <p className="text-xs text-[#77736D] dark:text-muted-foreground mb-1 truncate">
                          {product.categoryName || 'Đồ tuyển chọn'}
                        </p>
                        <h3 className="text-base font-semibold text-[#191919] dark:text-foreground line-clamp-2 min-h-[3rem] mb-4 group-hover:text-[#244C3A] dark:group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>

                        <div className="mt-auto space-y-3 pt-3 border-t border-[#E5E0D7] dark:border-border">
                          <div className="flex items-baseline justify-between gap-2">
                            <div>
                              <p className="text-[11px] text-[#77736D] dark:text-muted-foreground">
                                {hasHigherBid ? 'Giá cao nhất hiện tại' : 'Giá khởi điểm'}
                              </p>
                              <Money
                                value={currentBid}
                                className="text-lg font-bold text-[#191919] dark:text-foreground"
                              />
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] text-[#77736D] dark:text-muted-foreground">Lượt giá</p>
                              <NumberText
                                value={product.bidCount ?? 0}
                                className="text-sm font-semibold text-[#191919] dark:text-foreground"
                              />
                            </div>
                          </div>

                          {hasHigherBid && (
                            <p className="text-xs text-[#77736D] dark:text-muted-foreground">
                              Khởi điểm: <Money value={product.price} className="text-xs font-medium text-[#77736D] dark:text-muted-foreground" />
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-[#77736D] dark:text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-numeric font-medium text-[#244C3A] dark:text-primary">
                              <Clock className="w-3.5 h-3.5" />
                              <AuctionCountdownBadge endTime={product.auctionEndTime} />
                            </span>
                            <span title={formatDateTime(product.auctionEndTime)}>
                              <Gavel className="w-3.5 h-3.5 inline mr-1" />
                              Xem phiên
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })
            : DEMO_AUCTIONS.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: index * 0.06, ease: EDITORIAL_EASE }}
                  className="group editorial-card flex flex-col rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border overflow-hidden hover:border-[#244C3A]/40 dark:hover:border-primary/40 hover:shadow-elevated"
                >
                  <Link href="/products?sellType=AUCTION" className="flex flex-col flex-1">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5E0D7]/30 dark:bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 dark:bg-card/95 text-[#77736D] dark:text-muted-foreground text-[11px] font-semibold border border-[#E5E0D7] dark:border-border shadow-surface">
                          {item.statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <p className="text-xs text-[#77736D] dark:text-muted-foreground mb-1 truncate">
                        {item.categoryName}
                      </p>
                      <h3 className="text-base font-semibold text-[#191919] dark:text-foreground line-clamp-2 min-h-[3rem] mb-4 group-hover:text-[#244C3A] dark:group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <div className="mt-auto space-y-2.5 pt-3 border-t border-[#E5E0D7] dark:border-border">
                        <div className="flex items-baseline justify-between gap-2">
                          <div>
                            <p className="text-[11px] text-[#77736D] dark:text-muted-foreground">
                              Giá minh họa
                            </p>
                            <Money
                              value={item.currentBid}
                              className="text-lg font-bold text-[#191919] dark:text-foreground"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-[#77736D] dark:text-muted-foreground">Lượt giá</p>
                            <NumberText
                              value={item.bidCount}
                              className="text-sm font-semibold text-[#191919] dark:text-foreground"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-[#77736D] dark:text-muted-foreground">
                          Khởi điểm: <Money value={item.startingPrice} className="text-xs font-medium text-[#77736D] dark:text-muted-foreground" />
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs font-medium text-[#244C3A] dark:text-primary">
                          <span>{item.endNote}</span>
                          <span className="inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5">
                            Xem sàn <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
        </div>
      </div>
    </section>
  );
}
