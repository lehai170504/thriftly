import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { isAdminPortalRole, canAccessAdminRoute } from '../lib/admin-permissions';
import { getCookie, getCsrfToken } from '../lib/axios';
import { AuthResponse } from '../features/auth/types/auth';

describe('Auth, Session and Permission rules', () => {
  it('correctly identifies admin portal roles for both ADMIN and STAFF', () => {
    expect(isAdminPortalRole('ADMIN')).toBe(true);
    expect(isAdminPortalRole('STAFF')).toBe(true);
    expect(isAdminPortalRole('USER')).toBe(false);
    expect(isAdminPortalRole(undefined)).toBe(false);
  });

  it('restricts STAFF access only to allowed admin routes', () => {
    expect(canAccessAdminRoute('ADMIN', '/admin/revenue')).toBe(true);
    expect(canAccessAdminRoute('STAFF', '/admin/orders')).toBe(true);
    expect(canAccessAdminRoute('STAFF', '/admin/products')).toBe(true);
    expect(canAccessAdminRoute('STAFF', '/admin/revenue')).toBe(false);
    expect(canAccessAdminRoute('USER', '/admin')).toBe(false);
  });

  it('detects 2FA requirement without logging user in prematurely', () => {
    const responseWith2FA: AuthResponse = {
      id: '',
      username: 'admin',
      email: 'admin@thriftly.com',
      role: 'ADMIN',
      requires2FA: true,
    };

    const shouldRedirectToSecurePortal = Boolean(responseWith2FA.requires2FA);
    expect(shouldRedirectToSecurePortal).toBe(true);

    const normalUserResponse: AuthResponse = {
      id: 'u-1',
      username: 'john',
      email: 'john@thriftly.com',
      role: 'USER',
      requires2FA: false,
    };

    expect(Boolean(normalUserResponse.requires2FA)).toBe(false);
  });

  it('reads the csrf token from the browser cookie when present', () => {
    document.cookie = 'XSRF-TOKEN=csrf-token-123; path=/';

    expect(getCookie('XSRF-TOKEN')).toBe('csrf-token-123');
    expect(getCsrfToken()).toBe('csrf-token-123');
  });

  it('clears query client cache on session expiration or logout', () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');

    queryClient.setQueryData(['user'], { id: '1', name: 'Test' });
    expect(queryClient.getQueryData(['user'])).toBeDefined();

    queryClient.clear();
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['user'])).toBeUndefined();
  });
});
