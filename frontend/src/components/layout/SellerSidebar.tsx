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
      <div className="sticky top-24 bg-card glass border border-border rounded-[24px] p-4 shadow-sm">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Kênh người bán
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    !isActive && 'group-hover:scale-110'
                  )} />
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
