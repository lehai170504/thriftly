'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, LogOut, User as UserIcon, Wallet, Search, ShieldAlert, MessageCircle, Package, Store, Menu, LineChart, Heart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { NotificationDropdown } from './NotificationDropdown';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchProducts, useCategories } from '@/features/products/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function AppHeader() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const { data: searchResults, isLoading: isSearching } = useSearchProducts({ query: debouncedQuery });
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { data: categories } = useCategories();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      if (searchQuery.trim()) {
        router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/products`);
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    setShowDropdown(false);
    router.push(`/products/${productId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4 md:gap-8">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu */}
          <div className="xl:hidden">
            <Sheet>
              <SheetTrigger className="p-2 -ml-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors outline-none focus:ring-2 focus:ring-primary">
                <Menu className="w-6 h-6 text-foreground" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] border-r border-border glass p-0 flex flex-col">
                <SheetHeader className="p-6 text-left border-b border-border">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center overflow-hidden border border-border/50">
                      <img src="/logo.png?v=5" alt="Thriftly Logo" className="w-[120%] h-[120%] object-contain" />
                    </div>
                    <span className="text-2xl font-serif font-semibold tracking-tight text-foreground">
                      Thriftly.
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">Khám phá</div>
                  <Link href="/products?sort=createdAt_desc">
                    <Button variant="ghost" className="w-full justify-start text-base font-medium hover:bg-accent hover:text-primary h-12 rounded-xl">
                      Mới nhất
                    </Button>
                  </Link>
                  <Link href="/products?sort=price_asc">
                    <Button variant="ghost" className="w-full justify-start text-base font-medium hover:bg-accent hover:text-primary h-12 rounded-xl">
                      Giá rẻ
                    </Button>
                  </Link>
                  <Link href="/auctions">
                    <Button variant="ghost" className="w-full justify-start text-base font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 h-12 rounded-xl flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      Đấu giá LIVE
                    </Button>
                  </Link>

                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-6 mb-2 px-2">Danh mục</div>
                  {categories?.map((c) => (
                    <Link key={c.id} href={`/products?category=${c.id}`}>
                      <Button variant="ghost" className="w-full justify-start text-base font-medium hover:bg-accent hover:text-primary h-12 rounded-xl text-foreground">
                        {c.name}
                      </Button>
                    </Link>
                  ))}

                  {isAuthenticated && user?.role !== 'ADMIN' && (
                    <div className="mt-8 px-2">
                      <CreateProductModal />
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group -ml-2 xl:ml-0">
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 border border-border/50">
              <img src="/logo.png?v=5" alt="Thriftly Logo" className="w-[120%] h-[120%] object-contain" />
            </div>
            <span className="text-2xl font-serif font-semibold tracking-tight text-foreground">
              Thriftly.
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1 xl:gap-2 ml-4">
            <div
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DropdownMenuTrigger className="inline-flex items-center font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 h-9 rounded-md outline-none cursor-pointer transition-colors">
                  <Menu className="w-4 h-4 mr-2" />
                  Danh mục
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl">
                  {categories?.map((c) => (
                    <DropdownMenuItem key={c.id} className="cursor-pointer" onClick={() => router.push(`/products?category=${c.id}`)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <DropdownMenuItem disabled>
                      Chưa có danh mục nào
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer font-medium text-primary" onClick={() => router.push('/products')}>
                    Xem tất cả
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link href="/products?sort=createdAt_desc">
              <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 px-3">
                Mới nhất
              </Button>
            </Link>

            <Link href="/products?sort=price_asc">
              <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10 px-3">
                Giá rẻ
              </Button>
            </Link>

            <Link href="/auctions">
              <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Đấu giá LIVE
              </Button>
            </Link>

            <Link href="/live">
              <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] text-primary hover:bg-primary/10 px-3 flex items-center gap-1.5">
                Khám Phá Live
              </Button>
            </Link>
          </nav>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-2xl min-w-[200px] hidden md:flex items-center" ref={dropdownRef}>
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleSearch}
              className="w-full h-12 pl-12 pr-20 bg-background/50 border-border hover:bg-background focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent rounded-full text-base transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-[24px] shadow-2xl border-border overflow-hidden z-50">
                {searchQuery.trim() === '' ? (
                  <CommandPalette onSelect={() => setShowDropdown(false)} />
                ) : isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Đang tìm kiếm...
                  </div>
                ) : searchResults?.content && searchResults.content.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto py-2">
                    {searchResults.content.slice(0, 5).map((product: any) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                        onClick={() => handleSelectProduct(product.id)}
                      >
                        <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100&seed=${product.id}`}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{product.title}</h4>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="font-semibold text-primary">{formatCurrency(product.price)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground truncate">{product.categoryName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      className="p-3 text-center text-sm text-primary font-medium hover:bg-primary/5 cursor-pointer border-t border-border"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                    >
                      Xem tất cả kết quả
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Package className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Không tìm thấy sản phẩm nào</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <ThemeToggle />
          {!isMounted ? (
            <>
              <div className="hidden sm:block">
                <Button variant="default" className="opacity-0 pointer-events-none">Tạo sản phẩm</Button>
              </div>
              <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/10 font-medium opacity-0 pointer-events-none">
                Đăng nhập
              </Button>
            </>
          ) : (
            <>
              {user?.role !== 'ADMIN' && (
                <div className="hidden sm:block">
                  <CreateProductModal />
                </div>
              )}

              {user?.role !== 'ADMIN' && isAuthenticated && (
                <Link href="/chat" className="relative h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 outline-none transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  {(() => {
                    const conversations = queryClient.getQueryData<any[]>(['chatConversations']);
                    const unreadTotal = conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;
                    if (unreadTotal > 0) {
                      return (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive border border-background" />
                      );
                    }
                    return null;
                  })()}
                </Link>
              )}

              {user?.role !== 'ADMIN' && <NotificationDropdown />}

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 w-10 rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary/90 font-bold">
                        {(user?.fullName || user?.username || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-2 text-sm font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="font-bold text-base leading-none text-foreground">{user?.fullName || user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Hồ sơ của tôi</span>
                    </DropdownMenuItem>
                    {user?.role !== 'ADMIN' && (
                      <>
                        <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/wallet')}>
                          <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Ví của tôi</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/profile/favorites')}>
                          <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Sản phẩm yêu thích</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/orders')}>
                          <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Đơn mua</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-border/50" />

                        <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push('/seller/dashboard')}>
                          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Kênh người bán</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {user?.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem className="cursor-pointer py-2 bg-orange-50 text-orange-600 focus:bg-orange-100 focus:text-orange-700" onClick={() => router.push('/admin/withdrawals')}>
                          <Wallet className="mr-2 h-4 w-4" />
                          <span className="font-medium">Quản trị - Rút tiền</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer py-2 bg-red-50 text-red-600 focus:bg-red-100 focus:text-red-700" onClick={() => router.push('/admin/disputes')}>
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span className="font-medium">Quản trị - Khiếu nại</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer py-2 text-red-600 focus:bg-red-50 focus:text-red-700" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="font-medium">Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={openLoginModal} variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/10 font-medium">
                  Đăng nhập
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on small screens */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            readOnly
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full h-10 pl-10 pr-4 bg-background/50 border-border rounded-full text-sm cursor-text focus:ring-primary"
          />
        </div>
      </div>
    </header>
  );
}