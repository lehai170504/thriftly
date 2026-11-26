'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Gavel, Plus, ShieldCheck, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Money, NumberText } from '@/components/ui/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/features/products/hooks/useProducts';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import type { Product } from '@/features/products/types/product';

const EDITORIAL_HERO_IMAGE =
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85';

const EDITORIAL_ACCENT_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

function useRealAuctionCountdown(endTime?: string) {
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    if (!endTime) {
      setLabel('');
      return;
    }

    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Đã kết thúc');
        return;
      }
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setLabel(`${days} ngày ${hours % 24} giờ`);
      } else {
        const pad = (n: number) => String(n).padStart(2, '0');
        setLabel(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);

  return label;
}

export function LiveAuctionHero() {
  const { isAuthenticated, openRegisterModal } = useAuth();
  const { data } = useProducts(0, 12);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const featuredAuction = useMemo<Product | null>(() => {
    if (now === null) return null;
    const items = data?.content || [];
    const active = items.filter(
      (item) =>
        item.sellType === 'AUCTION' &&
        item.auctionEndTime &&
        new Date(item.auctionEndTime).getTime() > now
    );
    return active[0] ?? null;
  }, [data, now]);

  const countdown = useRealAuctionCountdown(featuredAuction?.auctionEndTime);

  return (
    <section className="relative w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-card border border-[#E5E0D7] dark:border-border text-xs font-medium text-[#244C3A] dark:text-primary mb-6"
            >
              <span className="size-1.5 rounded-full bg-[#244C3A] dark:bg-primary animate-pulse" />
              <span>Đấu giá trực tiếp &amp; Ký quỹ Escrow</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EDITORIAL_EASE }}
              className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold tracking-tight text-[#191919] dark:text-foreground leading-[1.12] mb-6"
            >
              Quá khứ của một người.{' '}
              <span className="block italic font-normal text-[#244C3A] dark:text-primary mt-1">
                Kho báu tiếp theo của bạn.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: EDITORIAL_EASE }}
              className="text-base sm:text-lg text-[#77736D] dark:text-muted-foreground leading-relaxed max-w-xl mb-8"
            >
              Khám phá những món đồ pre-loved độc bản, tham gia các phiên đấu giá trực tiếp kịch tính và giao dịch an tâm với quy trình bảo vệ thanh toán trung gian. Trao cho những món đồ giá trị một vòng đời mới.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: EDITORIAL_EASE }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10"
            >
              <Link href="/products?sellType=AUCTION" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-medium text-sm sm:text-base shadow-surface group transition-all duration-200 active:scale-[0.98]"
                >
                  Khám phá đấu giá
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <CreateProductModal>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/40 dark:hover:bg-accent font-medium text-sm sm:text-base transition-all duration-200 active:scale-[0.98]"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Bắt đầu bán
                  </Button>
                </CreateProductModal>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openRegisterModal}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/40 dark:hover:bg-accent font-medium text-sm sm:text-base transition-all duration-200 active:scale-[0.98]"
                >
                  Bắt đầu bán
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EDITORIAL_EASE }}
              className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-[#E5E0D7] dark:border-border w-full max-w-lg"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground font-medium mb-1">
                  Hình thức
                </p>
                <p className="text-sm font-semibold text-[#191919] dark:text-foreground">
                  Đấu giá &amp; Mua ngay
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground font-medium mb-1">
                  Bảo vệ tiền
                </p>
                <p className="text-sm font-semibold text-[#191919] dark:text-foreground">
                  Ký quỹ Escrow
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground font-medium mb-1">
                  Cập nhật giá
                </p>
                <p className="text-sm font-semibold text-[#191919] dark:text-foreground">
                  Thời gian thực
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.14, ease: EDITORIAL_EASE }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-3 sm:p-4 shadow-elevated group">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#E5E0D7]/40 dark:bg-muted">
                <img
                  src={
                    featuredAuction
                      ? featuredAuction.imageUrl || featuredAuction.images?.[0] || EDITORIAL_HERO_IMAGE
                      : EDITORIAL_HERO_IMAGE
                  }
                  alt={featuredAuction ? featuredAuction.title : 'Áo khoác da vintage tuyển chọn'}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                  {featuredAuction ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-card/95 text-[#191919] dark:text-foreground text-xs font-semibold shadow-surface">
                      <span className="size-1.5 rounded-full bg-[#244C3A] dark:bg-primary animate-pulse" />
                      {featuredAuction.isLive ? 'Đang phát trực tiếp' : 'Phiên đang mở'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-card/95 text-[#191919] dark:text-foreground text-xs font-medium shadow-surface">
                      <Tag className="w-3.5 h-3.5 text-[#244C3A] dark:text-primary" />
                      Góc tuyển chọn · Minh họa
                    </span>
                  )}

                  {featuredAuction && countdown && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191919]/85 text-white text-xs font-numeric font-semibold backdrop-blur-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {countdown}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 rounded-xl bg-white/95 dark:bg-card/95 backdrop-blur-md border border-[#E5E0D7] dark:border-border p-4 shadow-surface transition-transform duration-300 group-hover:-translate-y-0.5">
                  {featuredAuction ? (
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#77736D] dark:text-muted-foreground truncate mb-1">
                          {featuredAuction.categoryName || 'Đấu giá nổi bật'} · @{featuredAuction.sellerName}
                        </p>
                        <h2 className="text-sm sm:text-base font-semibold text-[#191919] dark:text-foreground truncate mb-1.5">
                          {featuredAuction.title}
                        </h2>
                        <div className="flex items-baseline gap-3">
                          <Money
                            value={
                              featuredAuction.currentHighestBid && featuredAuction.currentHighestBid > featuredAuction.price
                                ? featuredAuction.currentHighestBid
                                : featuredAuction.price
                            }
                            className="text-base sm:text-lg font-bold text-[#244C3A] dark:text-primary"
                          />
                          <span className="text-xs text-[#77736D] dark:text-muted-foreground">
                            <NumberText value={featuredAuction.bidCount ?? 0} className="font-semibold text-[#191919] dark:text-foreground" /> lượt giá
                          </span>
                        </div>
                      </div>
                      <Link href={`/auctions/${featuredAuction.id}`} className="shrink-0">
                        <Button
                          size="sm"
                          className="rounded-lg bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground h-9 px-3.5 text-xs font-medium"
                        >
                          <Gavel className="w-3.5 h-3.5 mr-1.5" />
                          Trả giá
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#77736D] dark:text-muted-foreground mb-0.5">
                          Thời trang Vintage · Phụ kiện
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-[#191919] dark:text-foreground truncate">
                          Săn tìm những món đồ có câu chuyện riêng
                        </p>
                      </div>
                      <Link href="/products?sellType=AUCTION" className="shrink-0">
                        <Button
                          size="sm"
                          className="rounded-lg bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground h-9 px-3.5 text-xs font-medium"
                        >
                          Xem phiên
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 absolute -left-8 top-12 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border px-3.5 py-2.5 shadow-elevated max-w-[230px] animate-float-slow">
              <div className="size-9 rounded-lg bg-[#244C3A]/10 dark:bg-primary/15 text-[#244C3A] dark:text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#191919] dark:text-foreground">Bảo vệ Escrow</p>
                <p className="text-[11px] text-[#77736D] dark:text-muted-foreground truncate">
                  Giữ tiền đến khi nhận hàng
                </p>
              </div>
            </div>

            <div className="hidden md:block absolute -right-5 top-1/3 w-20 h-20 rounded-xl overflow-hidden border-2 border-white dark:border-card shadow-elevated transition-transform duration-300 hover:scale-105">
              <img
                src={EDITORIAL_ACCENT_IMAGE}
                alt="Đồng hồ cổ điển"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
