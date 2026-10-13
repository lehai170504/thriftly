import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Wallet, ShoppingBag, Users, LayoutDashboard, Package, Tags, Shield, Settings, Ticket, FileText, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { canAccessAdminRoute } from '@/lib/admin-permissions';
import { BrandWordmark } from '@/components/layout/BrandWordmark';

const menuGroups = [
  {
    title: 'Bảng Điều Khiển',
    items: [
      { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'Thương Mại',
    items: [
      { name: 'Đơn hàng', icon: ShoppingBag, path: '/admin/orders', roles: ['ADMIN', 'STAFF'] },
      { name: 'Sản phẩm & Đấu giá', icon: Package, path: '/admin/products', roles: ['ADMIN', 'STAFF'] },
      { name: 'Danh mục', icon: Tags, path: '/admin/categories', roles: ['ADMIN', 'STAFF'] },
      { name: 'Mã giảm giá', icon: Ticket, path: '/admin/vouchers', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'Tài Chính',
    items: [
      { name: 'Dòng tiền Sàn', icon: Activity, path: '/admin/revenue', roles: ['ADMIN'] },
      { name: 'Yêu cầu rút tiền', icon: Wallet, path: '/admin/withdrawals', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'Kiểm Duyệt & Hỗ Trợ',
    items: [
      { name: 'Khiếu nại (Disputes)', icon: ShieldAlert, path: '/admin/disputes', roles: ['ADMIN', 'STAFF'] },
      { name: 'Trung tâm báo cáo', icon: FileText, path: '/admin/reports', roles: ['ADMIN'] },
      { name: 'Người dùng', icon: Users, path: '/admin/users', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'Hệ Thống',
    items: [
      { name: 'Cấu hình chung', icon: Settings, path: '/admin/settings', roles: ['ADMIN', 'STAFF'] },
      { name: 'Nhật ký hệ thống', icon: Shield, path: '/admin/audit-logs', roles: ['ADMIN', 'STAFF'] },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "glass border-r border-border flex flex-col flex-shrink-0 z-20 shadow-sm h-screen transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 h-6 w-6 rounded-full border-border bg-background shadow-md z-50 flex items-center justify-center hover:bg-accent hidden md:flex"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn("p-6 pb-4 flex items-center", isCollapsed ? "justify-center px-0" : "gap-3")}>
        <div className="flex items-center gap-3 shrink-0">
          <BrandWordmark showName={false} href="/admin" />
          {!isCollapsed && (
            <div className="text-foreground leading-none flex flex-col transition-opacity duration-200">
              <span className="font-brand text-xl font-semibold">Thriftly.</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">Admin Portal</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-6 mt-4 overflow-x-hidden">
        {menuGroups.map((group, idx) => {
          const visibleItems = group.items.filter(item => canAccessAdminRoute(user?.role, item.path));

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <h4 className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 truncate">
                  {group.title}
                </h4>
              ) : (
                <div className="w-8 mx-auto h-[1px] bg-border my-4" />
              )}
              <nav className="space-y-0.5 flex flex-col items-center">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path + '/'));
                  return (
                    <Link key={item.path} href={item.path} className="w-full">
                      <div
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                          "flex items-center rounded-lg transition-all duration-200 group w-full",
                          isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3",
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        )}
                      >
                        <item.icon className={cn(
                          "w-[18px] h-[18px] transition-transform duration-200 shrink-0",
                          isActive ? '' : 'group-hover:scale-110'
                        )} />
                        {!isCollapsed && (
                          <span className="text-sm truncate">{item.name}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className={cn("border-t border-border bg-background/50 backdrop-blur-sm", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("flex items-center rounded-xl bg-accent/50", isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2")}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0" title={user?.username}>
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-foreground">{user?.username || 'Admin'}</div>
              <div className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-wider">{user?.role || 'Administrator'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
