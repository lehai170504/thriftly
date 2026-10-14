import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LineChart, Store, Package, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Tổng quan', icon: LineChart, path: '/seller/dashboard' },
  { name: 'Đơn bán', icon: Store, path: '/seller/orders' },
  { name: 'Sản phẩm', icon: Package, path: '/seller/products' },
  { name: 'Mã giảm giá', icon: Tag, path: '/seller/vouchers' },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-24 bg-card border border-border rounded-2xl p-3.5 shadow-surface">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Kênh người bán
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors w-full",
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
