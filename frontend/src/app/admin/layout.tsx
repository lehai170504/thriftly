'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { canAccessAdminRoute, isAdminPortalRole } from '@/lib/admin-permissions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const canAccessRoute = !!user && canAccessAdminRoute(user.role, pathname);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) router.replace('/portal-secure-entry');
    else if (!isAdminPortalRole(user.role)) router.replace('/');
    else if (!canAccessRoute) router.replace('/admin');
  }, [canAccessRoute, isAuthLoading, user, router]);

  if (isAuthLoading || !user || !isAdminPortalRole(user.role) || !canAccessRoute) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground bg-background">Đang tải cấu hình Quản trị viên...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-background/50 relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
