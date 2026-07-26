'use client';

import { useState, useEffect } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('thriftly-announcement-dismissed');
    if (!isDismissed && pathname?.startsWith('/products')) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem('thriftly-announcement-dismissed', 'true');
    setIsVisible(false);
  };

  if (!pathname?.startsWith('/products')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-[60] bg-foreground text-background overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2.5 sm:py-3 relative flex items-center justify-center text-center">
            <div className="flex items-center flex-wrap justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium pr-8">
              <span className="flex items-center gap-1.5 bg-background text-foreground px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Mới
              </span>
              <span>
                Trải nghiệm tính năng Đấu giá Trực tuyến (Live Auction) hoàn toàn mới của Thriftly.
              </span>
              <Link
                href="/products?sellType=AUCTION"
                className="inline-flex items-center gap-1 font-bold underline underline-offset-4 hover:text-background/80 transition-colors"
                onClick={handleDismiss}
              >
                Khám phá ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute right-4 p-1.5 rounded-full hover:bg-background/20 hover:text-background transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
