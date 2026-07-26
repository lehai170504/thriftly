'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, LogOut, User as UserIcon, Wallet, Search, ShieldAlert, MessageCircle, Package, Store, Menu, Heart, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { NotificationDropdown } from './NotificationDropdown';
import { ThemeToggle } from './ThemeToggle';
import { useCategories } from '@/features/products/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { CategoryIcon } from '../ui/category-icon';
import { GlobalSearchModal } from './GlobalSearchModal';

export default function AppHeader() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(null);

  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { data: categories } = useCategories();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

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
              className="relative group/mega"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <div className={`inline-flex items-center font-bold uppercase tracking-widest text-[10px] px-3 h-9 rounded-md outline-none cursor-pointer transition-colors ${isCategoryOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                <Menu className="w-4 h-4 mr-2" />
                Danh mục
              </div>

              {/* Mega Menu Dropdown */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 pt-4 z-50">
                  <div className="w-[750px] bg-popover/98 backdrop-blur-2xl rounded-[16px] shadow-xl border border-border/60 text-popover-foreground overflow-hidden flex min-h-[380px] animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300 ease-out">
                    {/* Left Sidebar - Main Categories */}
                    <div className="w-1/3 bg-transparent border-r border-border/50 py-4 flex flex-col gap-1 px-2">
                      {categories?.map((c) => (
                        <div
                          key={c.id}
                          onMouseEnter={() => setActiveCategory(c)}
                          onClick={() => router.push(`/products?category=${c.id}`)}
                          className={`px-4 py-2.5 mx-1 cursor-pointer rounded-2xl flex items-center justify-between transition-all duration-300 ${activeCategory?.id === c.id ? 'bg-primary/10 text-primary font-semibold shadow-sm scale-[1.02]' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
                        >
                          <span className="text-sm">{c.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-all duration-300 ${activeCategory?.id === c.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        </div>
                      ))}
                      {(!categories || categories.length === 0) && (
                        <div className="px-4 py-4 text-sm text-muted-foreground text-center mt-4">
                          Chưa có danh mục nào
                        </div>
                      )}
                    </div>

                    {/* Right Content - Subcategories */}
                    <div className="w-2/3 p-6 bg-transparent">
                      {activeCategory && (
                        <div className="h-full flex flex-col animate-in fade-in duration-500">
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                            <h3 className="text-xl font-bold text-foreground tracking-tight">{activeCategory.name}</h3>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-8 text-xs font-semibold rounded-full px-4 bg-primary/5 hover:bg-primary/10 transition-colors" onClick={() => router.push(`/products?category=${activeCategory.id}`)}>
                              Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </div>

                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                              <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                {activeCategory.subCategories.map((sub: any) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => router.push(`/products?category=${sub.id}`)}
                                    className="group cursor-pointer flex flex-col items-center text-center gap-3"
                                  >
                                    <div className="w-[72px] h-[72px] bg-muted/40 rounded-[24px] overflow-hidden border border-border/40 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative">
                                      {sub.icon ? (
                                        sub.icon.startsWith('http') || sub.icon.startsWith('/') ? (
                                          <img src={sub.icon} alt={sub.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                          <CategoryIcon name={sub.icon} className="w-8 h-8 text-muted-foreground/70 group-hover:text-primary transition-colors duration-300 z-10" />
                                        )
                                      ) : (
                                        <Package className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-300 z-10" />
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 px-1">{sub.name}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 mt-4">
                                <Store className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-sm font-medium">Không có danh mục con</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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

        {/* Global Search Bar (Trigger for Modal) */}
        <div className="flex-1 max-w-2xl min-w-[150px] hidden md:flex items-center justify-end xl:justify-center">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="group flex items-center justify-between w-full max-w-[400px] h-11 px-4 bg-background/50 border border-border hover:border-primary/50 hover:bg-accent/50 rounded-full transition-all text-sm text-muted-foreground shadow-sm"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
              <span className="truncate">Tìm kiếm sản phẩm, thương hiệu...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-6 shrink-0 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
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
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center justify-between w-full h-10 px-4 bg-background/50 border border-border rounded-full text-sm text-muted-foreground shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            <span>Tìm kiếm...</span>
          </div>
        </button>
      </div>

      <GlobalSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </header>
  );
}