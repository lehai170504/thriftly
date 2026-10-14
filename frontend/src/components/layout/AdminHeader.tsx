'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, Search, Menu, Banknote, Scale, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAdminSearch, useAdminNotifications } from '@/features/admin/hooks/useAdminHeaderHooks';
import { normalizePageResponse } from '@/lib/pagination';
import { ThemeToggle } from './ThemeToggle';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Custom hook for debounce (or inline it)
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isFetching: isSearching } = useAdminSearch(debouncedQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { withdrawalsData, disputesData } = useAdminNotifications();

  const pendingWithdrawalsCount = normalizePageResponse(withdrawalsData).totalElements;
  const pendingDisputesCount = normalizePageResponse(disputesData).totalElements;
  const totalNotifications = pendingWithdrawalsCount + pendingDisputesCount;

  const handleResultClick = (type: 'user' | 'order' | 'product', id?: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (type === 'user') router.push('/admin/users');
    if (type === 'order') router.push('/admin/orders');
    if (type === 'product' && id) router.push(`/products/${id}`);
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground">
          <Menu className="w-5 h-5" />
        </Button>
        <div ref={searchRef} className="relative w-full max-w-md hidden md:block z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => { if (searchQuery.trim()) setIsSearchOpen(true); }}
            placeholder="Tìm mã đơn hàng (VD: #123) hoặc username..."
            className="pl-10 h-10 bg-background border-border focus-visible:bg-background focus-visible:ring-primary rounded-xl text-sm w-full text-foreground"
          />

          {/* Search Dropdown */}
          {isSearchOpen && debouncedQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden max-h-[70vh] overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Đang tìm kiếm...</div>
              ) : searchResults ? (
                <div className="py-2">
                  {(searchResults.users?.length || 0) > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Người dùng</div>
                      {(searchResults.users || []).map((u: any) => (
                        <div key={u.id} onClick={() => handleResultClick('user')} className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex flex-col items-center justify-center font-bold text-xs">{u.username.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{u.username}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(searchResults.orders?.length || 0) > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn hàng & Sản phẩm</div>
                      {(searchResults.orders || []).map((o: any) => (
                        <div key={o.id} onClick={() => handleResultClick('order')} className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-muted flex flex-col items-center justify-center text-muted-foreground"><Search className="w-4 h-4" /></div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-foreground truncate">{o.productTitle}</div>
                            <div className="text-xs text-muted-foreground font-mono">#{o.id.substring(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(searchResults.products?.length || 0) > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Sản phẩm</div>
                      {(searchResults.products || []).map((p: any) => (
                        <div key={p.id} onClick={() => handleResultClick('product', p.id)} className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Search className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-foreground truncate">{p.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{p.categoryName} • {p.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(searchResults.users || []).length === 0 && (searchResults.orders || []).length === 0 && (searchResults.products || []).length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">Không tìm thấy kết quả nào.</div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="relative text-muted-foreground hover:text-primary transition-colors focus:outline-none flex items-center justify-center p-2 rounded-full hover:bg-primary/10">
            <div className="relative inline-flex">
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-xs font-bold text-white flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 border-border bg-card shadow-xl">
            <div className="px-2 py-1.5 font-heading font-bold text-foreground text-sm">Thông báo chờ xử lý</div>
            <DropdownMenuSeparator className="bg-muted/80" />

            {totalNotifications === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Không có việc nào cần xử lý lúc này.
              </div>
            ) : (
              <div className="space-y-1">
                {pendingWithdrawalsCount > 0 && (
                  <DropdownMenuItem
                    className="p-3 cursor-pointer rounded-xl hover:bg-orange-50 focus:bg-orange-50 outline-none flex items-center gap-3 w-full"
                    onClick={() => router.push('/admin/withdrawals')}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">Yêu cầu rút tiền mới</p>
                      <p className="text-xs text-muted-foreground truncate">Có {pendingWithdrawalsCount} yêu cầu đang chờ bạn chuyển khoản.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </DropdownMenuItem>
                )}

                {pendingDisputesCount > 0 && (
                  <DropdownMenuItem
                    className="p-3 cursor-pointer rounded-xl hover:bg-red-50 focus:bg-red-50 outline-none flex items-center gap-3 w-full"
                    onClick={() => router.push('/admin/disputes')}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">Đơn hàng bị khiếu nại</p>
                      <p className="text-xs text-muted-foreground truncate">Có {pendingDisputesCount} đơn hàng cần được phân xử.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </DropdownMenuItem>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-[1px] bg-muted/80 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-none mb-1">{user?.username}</p>
            <p className="text-xs uppercase tracking-widest font-bold text-primary leading-none">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary border border-primary/20">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 ml-1 rounded-full transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
