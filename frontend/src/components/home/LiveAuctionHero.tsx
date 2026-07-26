'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/fade-in';
import { motion } from 'framer-motion';

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

export function LiveAuctionHero({ product }: LiveAuctionHeroProps) {
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
  ];

  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] flex items-center pt-28 pb-16 overflow-hidden">
      {/* Background Image & Overlays */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80"
          alt="Vintage clothing background"
          className="w-full h-full object-cover object-center opacity-100"
        />
        {/* Dark overlay to ensure text readability across the entire image */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
      </motion.div>

      <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center max-w-4xl">
          <FadeIn delay={0.2} direction="up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 shadow-xl text-xs font-semibold mb-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/40 transition-all duration-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nền Tảng Đấu Giá AI & Escrow An Toàn Số 1</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.3} direction="up">
            <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-[1] mb-4 font-serif drop-shadow-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Thriftly<span className="text-primary">.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white/90 leading-[1.3] mb-8 font-heading drop-shadow-lg">
              Tái sinh phong cách, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 drop-shadow-lg">Đấu giá dễ dàng</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.5} direction="up">
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-12 max-w-2xl font-medium drop-shadow-md">
              Dự đoán giá chuẩn xác bằng AI, đấu giá trực tiếp thời gian thực qua WebSocket và bảo vệ dòng tiền 100% bằng cơ chế thanh toán Escrow an toàn. Khám phá kho báu thời trang vintage cao cấp ngay hôm nay.
            </p>
          </FadeIn>

          <FadeIn delay={0.6} direction="up" className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full sm:w-auto">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-base font-semibold shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
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
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-9 bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60 rounded-2xl text-base font-semibold shadow-xl transition-all duration-300">
                  Xem cách hoạt động
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.8} direction="up" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-white/20 w-full max-w-md mx-auto">
              <div className="flex -space-x-3 overflow-hidden p-1">
                {avatars.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`User avatar ${index + 1}`}
                    className="inline-block h-12 w-12 rounded-full ring-4 ring-background object-cover shadow-sm hover:-translate-y-1 transition-transform duration-300 relative z-10"
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base font-medium text-white/80 text-center">
                Tin dùng bởi <span className="font-bold text-white">10,000+</span> người dùng toàn quốc
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
