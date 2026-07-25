'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Timer, Gavel, CheckCircle2, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { LiveBidsCounter } from './LiveBidsCounter';
import { useProducts } from '@/features/products/hooks/useProducts';

interface LiveAuctionHeroProps {
  product?: {
    id: string;
    title: string;
    currentHighestBid?: number;
    price: number;
    auctionEndTime?: string;
    imageUrl?: string;
    bidCount?: number;
    sellerName?: string;
  };
}

export function LiveAuctionHero({ product: initialProduct }: LiveAuctionHeroProps) {
  const { data } = useProducts(0, 10);
  const now = new Date().getTime();
  const auctionProducts = data?.content?.filter((p: any) => {
    if (p.sellType !== 'AUCTION') return false;
    if (!p.auctionEndTime) return false;
    return new Date(p.auctionEndTime).getTime() > now;
  }) || [];
  const defaultFallbackProduct = {
    id: 'demo',
    title: 'Bộ sưu tập đồ cổ (Sản phẩm mẫu)',
    price: 5000000,
    currentHighestBid: 6500000,
    auctionEndTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=thriftswap',
    sellerName: 'Thriftly System'
  };

  const product = initialProduct || auctionProducts[0] || defaultFallbackProduct;

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!product?.auctionEndTime) {
      setTimeLeft('Đang diễn ra');
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(product.auctionEndTime!).getTime();
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
  }, [product?.auctionEndTime]);

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
  ];

  return (
    <section className="w-full min-h-[calc(100vh-5rem)] relative flex items-center justify-center bg-background pt-28 pb-16 overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-xs font-semibold mb-6 bg-card border-border text-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nền Tảng Đấu Giá AI &amp; Escrow An Toàn Số 1</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] mb-6 font-heading">
              Đấu Giá Thông Minh &amp; Giao Dịch An Toàn Với AI
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl font-normal">
              Dự đoán giá chuẩn xác bằng AI, đấu giá trực tiếp thời gian thực qua WebSocket và bảo vệ dòng tiền 100% bằng cơ chế thanh toán Escrow an toàn.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
              <Link href={product ? `/auctions/${product.id}` : "/products"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group">
                  Bắt đầu đấu giá ngay
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link
                href="/#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-9 bg-card border-border text-foreground hover:bg-accent rounded-xl text-base font-semibold shadow-sm transition-all duration-200">
                  Xem cách hoạt động
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border w-full">
              <div className="flex -space-x-2.5 overflow-hidden">
                {avatars.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`User avatar ${index + 1}`}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-background object-cover shadow-sm"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Tin dùng bởi <span className="font-bold text-foreground">10,000+</span> người mua &amp; người bán toàn quốc
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="relative w-full max-w-[540px] bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-slate-200/80 z-10 transition-all duration-300 hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    TS
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {product?.sellerName || "Thriftly Verified Seller"}
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Phiên đấu giá thời gian thực</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang diễn ra
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-50 mb-5 group">
                <img
                  src={product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=thriftswap"}
                  alt={product?.title || "Sản phẩm đấu giá"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Timer className="w-4 h-4 text-amber-400" />
                  {isExpired ? 'Đã kết thúc' : timeLeft}
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2 rounded-2xl shadow-xl text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Giá hiện tại</p>
                  <p className="text-base sm:text-lg font-black text-blue-600">
                    {formatCurrency(product?.currentHighestBid || product?.price || 100000)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-1">
                  {product?.title || "Sản phẩm đấu giá thời gian thực"}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Cpu className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">AI Định Giá</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">Chuẩn 98.5%</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Escrow Shield</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">Tạm Giữ 100%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  {product?.id ? (
                    <LiveBidsCounter productId={product.id} />
                  ) : (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      12 Lượt đặt giá hôm nay
                    </div>
                  )}

                  <Link href={product ? `/auctions/${product.id}` : "/products"} className="shrink-0">
                    <Button size="lg" className="h-12 px-7 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg">
                      <Gavel className="w-4 h-4" /> Đặt giá ngay
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
