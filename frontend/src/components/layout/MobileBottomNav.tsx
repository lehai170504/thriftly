'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Gavel, Home, PlusCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, openLoginModal } = useAuth();

  const isAuctionTab = pathname === '/products' && searchParams.get('sellType') === 'AUCTION';
  const isExploreTab = pathname === '/products' && !isAuctionTab;
  const isHomeTab = pathname === '/';
  const isAccountTab = pathname?.startsWith('/profile') || pathname?.startsWith('/dashboard');

  const itemClass = (active: boolean) =>
    cn(
      'flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] px-1 text-[11px] font-medium transition-colors duration-200',
      active
        ? 'text-[#244C3A] dark:text-primary font-semibold'
        : 'text-[#77736D] dark:text-muted-foreground hover:text-[#191919] dark:hover:text-foreground'
    );

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-[#E5E0D7] dark:border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.05)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        <Link href="/" className={itemClass(isHomeTab)}>
          <Home className={cn('w-5 h-5', isHomeTab && 'stroke-[2.25]')} />
          <span>Trang chủ</span>
        </Link>

        <Link href="/products" className={itemClass(isExploreTab)}>
          <Compass className={cn('w-5 h-5', isExploreTab && 'stroke-[2.25]')} />
          <span>Khám phá</span>
        </Link>

        {isAuthenticated ? (
          <CreateProductModal>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] px-1 text-[11px] font-medium text-[#244C3A] dark:text-primary"
            >
              <PlusCircle className="w-6 h-6" />
              <span>Đăng bán</span>
            </button>
          </CreateProductModal>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] px-1 text-[11px] font-medium text-[#244C3A] dark:text-primary"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Đăng bán</span>
          </button>
        )}

        <Link href="/products?sellType=AUCTION" className={itemClass(isAuctionTab)}>
          <Gavel className={cn('w-5 h-5', isAuctionTab && 'stroke-[2.25]')} />
          <span>Đấu giá</span>
        </Link>

        {isAuthenticated ? (
          <Link href="/profile" className={itemClass(isAccountTab)}>
            <User className={cn('w-5 h-5', isAccountTab && 'stroke-[2.25]')} />
            <span>Tài khoản</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className={itemClass(false)}
          >
            <User className="w-5 h-5" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </nav>
  );
}
