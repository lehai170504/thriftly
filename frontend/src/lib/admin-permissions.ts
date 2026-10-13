export type AdminPortalRole = 'ADMIN' | 'STAFF';

const STAFF_ROUTES = [
  '/admin',
  '/admin/orders',
  '/admin/products',
  '/admin/categories',
  '/admin/vouchers',
  '/admin/withdrawals',
  '/admin/disputes',
  '/admin/users',
  '/admin/settings',
  '/admin/audit-logs',
] as const;

export const isAdminPortalRole = (role?: string): role is AdminPortalRole =>
  role === 'ADMIN' || role === 'STAFF';

export const canAccessAdminRoute = (role: string | undefined, pathname: string): boolean => {
  if (role === 'ADMIN') return true;
  if (role !== 'STAFF') return false;

  return STAFF_ROUTES.some((route) =>
    route === '/admin'
      ? pathname === route
      : pathname === route || pathname.startsWith(`${route}/`),
  );
};
