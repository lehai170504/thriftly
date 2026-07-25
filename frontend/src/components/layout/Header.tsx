'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Wallet, Plus, LayoutDashboard, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { GlobalSearchModal } from './GlobalSearchModal';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/' || pathname === '') {
      e.preventDefault();
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 border border-border shadow-sm">
            <img src="/logo.png?v=5" alt="Thriftly Logo" className="w-[120%] h-[120%] object-contain" />
          </div>
          <span className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Thriftly.
          </span>
        </Link>

        <div className="flex items-center gap-6 lg:gap-8">
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link
              href="/products"
              className={`transition-colors hover:text-foreground ${pathname === '/products' ? 'text-foreground font-semibold' : ''}`}
            >
              Khám phá
            </Link>
            <Link
              href="/products?sellType=AUCTION"
              className={`transition-colors hover:text-foreground ${pathname?.includes('sellType=AUCTION') ? 'text-foreground font-semibold' : ''}`}
            >
              Đấu giá
            </Link>
            <Link
              href="/#how-it-works"
              onClick={handleHowItWorksClick}
              className="transition-colors hover:text-foreground"
            >
              Quy trình
            </Link>
            <Link
              href="/about"
              className={`transition-colors hover:text-foreground ${pathname === '/about' ? 'text-foreground font-semibold' : ''}`}
            >
              Về chúng tôi
            </Link>
          </nav>

          <div className="hidden lg:flex items-center mx-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="group flex items-center justify-between w-full min-w-[200px] xl:min-w-[260px] h-10 px-4 bg-background/50 border border-border hover:border-primary/50 hover:bg-accent/50 rounded-full transition-all text-sm text-muted-foreground shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
                <span className="truncate">Tìm kiếm...</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 shrink-0 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-primary rounded-full"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={openLoginModal}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent rounded-xl px-5 h-10 text-sm font-medium shadow-sm"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={openRegisterModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 h-10 text-sm font-medium shadow-md shadow-primary/20"
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <CreateProductModal>
                  <Button variant="outline" className="hidden sm:flex rounded-xl gap-2 border-border font-medium hover:bg-accent transition-colors h-10 text-foreground">
                    <Plus className="w-4 h-4" /> Đăng tin
                  </Button>
                </CreateProductModal>

                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <Avatar className="h-10 w-10 border border-border cursor-pointer hover:border-primary transition-colors shadow-sm">
                      <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} className="object-cover" />
                      <AvatarFallback className="bg-muted text-foreground font-medium">
                        {(user?.fullName || user?.username || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-border shadow-2xl bg-popover/95 backdrop-blur-xl mt-2 text-popover-foreground">
                    <div className="px-3 py-2.5 mb-1">
                      <p className="font-bold text-sm text-foreground truncate">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border mb-1" />

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors" onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      <span className="font-medium text-sm">Bảng điều khiển</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors" onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-3 h-4 w-4" />
                      <span className="font-medium text-sm">Tài khoản của tôi</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors" onClick={() => router.push('/wallet')}>
                      <Wallet className="mr-3 h-4 w-4" />
                      <span className="font-medium text-sm">Ví Thriftly</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 focus:bg-accent text-foreground transition-colors" onClick={() => router.push('/profile/favorites')}>
                      <Heart className="mr-3 h-4 w-4" />
                      <span className="font-medium text-sm">Sản phẩm yêu thích</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-border my-1" />

                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 text-red-500 focus:bg-red-500/10 focus:text-red-500 transition-colors" onClick={logout}>
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium text-sm">Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      <GlobalSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </header>
  );
}
