'use client';

import { useProducts } from '@/features/products/hooks/useProducts';
import { AuctionProductCard } from '@/components/home/AuctionProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/ui/loading-skeletons';
import { useRef } from 'react';

export function FeaturedProducts() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useProducts(0, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col mb-8">
            <div className="w-48 h-4 bg-slate-200 animate-pulse rounded-full mb-4"></div>
            <div className="w-64 h-10 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const now = new Date().getTime();
  let auctionProducts: any[] = (data.content || []).filter((p: any) => {
    if (p.sellType !== 'AUCTION') return false;
    if (!p.auctionEndTime) return false;
    return new Date(p.auctionEndTime).getTime() > now;
  });

  if (auctionProducts.length === 0) {
    auctionProducts = [
      {
        id: 'demo-1',
        title: 'MacBook Pro M3 Max 2023 (Demo)',
        price: 50000000,
        currentHighestBid: 55000000,
        auctionEndTime: new Date(new Date().getTime() + 12 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
        sellerName: 'Thriftly System'
      },
      {
        id: 'demo-2',
        title: 'Đồng hồ Rolex Submariner (Demo)',
        price: 120000000,
        currentHighestBid: 150000000,
        auctionEndTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=80',
        sellerName: 'Thriftly System'
      },
      {
        id: 'demo-3',
        title: 'Máy ảnh Sony A7IV (Demo)',
        price: 45000000,
        currentHighestBid: 48000000,
        auctionEndTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
        sellerName: 'Thriftly System'
      },
      {
        id: 'demo-4',
        title: 'Giày Nike Air Jordan 1 (Demo)',
        price: 4000000,
        currentHighestBid: 5500000,
        auctionEndTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        sellerName: 'Thriftly System'
      }
    ];
  }

  if (auctionProducts.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden py-2">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-blue-600/50"></span>
              Phiên đấu giá
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2 font-sans">
              Khám Phá Phiên Đấu Giá Nổi Bật
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              Cơ hội sở hữu những món đồ độc đáo với giá tốt nhất hôm nay.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full border-slate-200 hover:bg-slate-100">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full border-slate-200 hover:bg-slate-100">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="rounded-full px-5 hover:bg-slate-100 font-semibold text-slate-700">
                Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-6 pt-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {auctionProducts.map((product: any) => (
              <div key={product.id} className="w-[280px] sm:w-[320px] lg:w-[340px] snap-start shrink-0 transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl rounded-2xl">
                <AuctionProductCard product={product} />
              </div>
            ))}

            <div className="w-[280px] sm:w-[320px] lg:w-[340px] snap-start shrink-0 flex items-center justify-center p-4">
              <Link href="/products" className="group flex flex-col items-center justify-center gap-5 w-full h-full min-h-[360px] rounded-[2rem] bg-white border border-slate-200 hover:border-blue-400 transition-all duration-500 hover:shadow-lg hover:-translate-y-1.5 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  <ArrowRight className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors duration-500" />
                </div>
                <span className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors duration-300">Xem toàn bộ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
