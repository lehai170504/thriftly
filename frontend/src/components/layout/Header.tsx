'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  User as UserIcon,
  Wallet,
  Plus,
  LayoutDashboard,
  Heart,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { GlobalSearchModal } from './GlobalSearchModal';
import { BrandWordmark } from './BrandWordmark';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false);
    if (pathname === '/' || pathname === '') {
      e.preventDefault();
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { href: '/products', label: 'Khám phá', active: pathname === '/products' },
    { href: '/products?sellType=AUCTION', label: 'Đấu giá trực tiếp', active: false },
    { href: '/#how-it-works', label: 'Quy trình', active: false, onClick: handleHowItWorksClick },
    { href: '/about', label: 'Về chúng tôi', active: pathname === '/about' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-[#F5F2EC]/90 dark:bg-background/90 backdrop-blur-md border-b border-[#E5E0D7] dark:border-border shadow-surface'
          : 'bg-[#F5F2EC]/80 dark:bg-background/80 backdrop-blur-sm border-b border-[#E5E0D7]/60 dark:border-border/60'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <BrandWordmark />

          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  'relative py-1.5 transition-colors duration-200 hover:text-[#191919] dark:hover:text-foreground after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1.5px] after:bg-[#244C3A] dark:after:bg-primary after:origin-left after:transition-transform after:duration-300',
                  item.active
                    ? 'text-[#191919] dark:text-foreground font-semibold after:scale-x-100'
                    : 'text-[#77736D] dark:text-muted-foreground after:scale-x-0 hover:after:scale-x-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden lg:flex items-center justify-between min-w-[210px] xl:min-w-[240px] h-10 px-3.5 bg-white/80 dark:bg-card/80 border border-[#E5E0D7] dark:border-border hover:border-[#244C3A]/50 dark:hover:border-primary/50 rounded-full transition-colors text-sm text-[#77736D] dark:text-muted-foreground"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">Tìm kiếm món đồ...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 shrink-0 select-none items-center gap-0.5 rounded bg-[#F5F2EC] dark:bg-muted px-1.5 font-mono text-[11px] font-medium text-[#77736D] dark:text-muted-foreground ml-2">
              <span>⌘</span>K
            </kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Tìm kiếm"
            className="lg:hidden text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/50 dark:hover:bg-accent rounded-full size-10"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2.5">
              <Button
                onClick={openLoginModal}
                variant="ghost"
                className="text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/50 dark:hover:bg-accent rounded-xl px-4 h-10 text-sm font-medium"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={openRegisterModal}
                className="bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 rounded-xl px-5 h-10 text-sm font-medium shadow-surface"
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <CreateProductModal>
                <Button
                  variant="outline"
                  className="hidden sm:flex rounded-xl gap-1.5 border-[#E5E0D7] dark:border-border bg-white dark:bg-card hover:bg-[#F5F2EC] dark:hover:bg-accent font-medium h-10 text-[#191919] dark:text-foreground"
                >
                  <Plus className="w-4 h-4" /> Đăng tin
                </Button>
              </CreateProductModal>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-[#244C3A]">
                  <Avatar className="h-10 w-10 border border-[#E5E0D7] dark:border-border cursor-pointer hover:border-[#244C3A] dark:hover:border-primary transition-colors">
                    <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} className="object-cover" />
                    <AvatarFallback className="bg-[#244C3A]/10 text-[#244C3A] dark:bg-muted dark:text-foreground font-medium">
                      {(user?.fullName || user?.username || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-2xl p-2 border-[#E5E0D7] dark:border-border shadow-overlay bg-white/95 dark:bg-popover/95 backdrop-blur-xl mt-2 text-popover-foreground"
                >
                  <div className="px-3 py-2.5 mb-1">
                    <p className="font-semibold text-sm text-foreground truncate">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border mb-1" />

                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors"
                    onClick={() => router.push('/dashboard')}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    <span className="font-medium text-sm">Bảng điều khiển</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors"
                    onClick={() => router.push('/profile')}
                  >
                    <UserIcon className="mr-3 h-4 w-4" />
                    <span className="font-medium text-sm">Tài khoản của tôi</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors"
                    onClick={() => router.push('/wallet')}
                  >
                    <Wallet className="mr-3 h-4 w-4" />
                    <span className="font-medium text-sm">Ví Thriftly</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors"
                    onClick={() => router.push('/profile/favorites')}
                  >
                    <Heart className="mr-3 h-4 w-4" />
                    <span className="font-medium text-sm">Sản phẩm yêu thích</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border my-1" />

                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl py-2.5 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                    onClick={logout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium text-sm">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/50 dark:hover:bg-accent rounded-xl size-10"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-[#E5E0D7] dark:border-border bg-[#F5F2EC] dark:bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <nav aria-label="Điều hướng di động" className="flex flex-col gap-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      'min-h-[44px] flex items-center px-3 rounded-xl text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-white dark:bg-card text-[#191919] dark:text-foreground font-semibold'
                        : 'text-[#77736D] dark:text-muted-foreground hover:bg-white/60 dark:hover:bg-card/60 hover:text-[#191919] dark:hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E5E0D7] dark:border-border sm:hidden">
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    variant="outline"
                    className="h-11 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openRegisterModal();
                    }}
                    className="h-11 rounded-xl bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground"
                  >
                    Đăng ký
                  </Button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#E5E0D7] dark:border-border sm:hidden">
                  <CreateProductModal>
                    <Button className="w-full h-11 rounded-xl gap-2 bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground">
                      <Plus className="w-4 h-4" /> Đăng tin bán đồ
                    </Button>
                  </CreateProductModal>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </header>
  );
}
