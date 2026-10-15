'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import { AuthResponse } from '@/features/auth/types/auth';
import { isAdminPortalRole } from '@/lib/admin-permissions';

import { AuthPromptModal, AuthPromptOptions } from '@/components/auth/AuthPromptModal';

interface AuthContextType {
  user: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  closeAuthPrompt: () => void;
  requireAuth: (action: () => void, options?: AuthPromptOptions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<{ isOpen: boolean; options?: AuthPromptOptions }>({ isOpen: false });
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        await authApi.prepareCsrf();
        const currentUser = await authApi.me();
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsAuthLoading(false);
      }
    };
    restoreSession();

    const expire = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener('thriftly:session-expired', expire);
    return () => {
      active = false;
      window.removeEventListener('thriftly:session-expired', expire);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!isAuthLoading && isAdminPortalRole(user?.role) && !pathname.startsWith('/admin')) {
      router.push('/admin');
    }
  }, [isAuthLoading, user, pathname, router]);

  const login = (data: AuthResponse) => {
    if (data.requires2FA) return;
    setUser(data);
    router.push(isAdminPortalRole(data.role) ? '/admin' : '/products');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.clear();
      setUser(null);
      await authApi.prepareCsrf().catch(() => undefined);
      router.push('/');
    }
  };

  const openAuthPrompt = (options?: AuthPromptOptions) => {
    setAuthPrompt({ isOpen: true, options });
  };

  const closeAuthPrompt = () => {
    setAuthPrompt(prev => ({ ...prev, isOpen: false }));
  };

  const requireAuth = (action: () => void, options?: AuthPromptOptions): boolean => {
    if (user) {
      action();
      return true;
    }
    openAuthPrompt(options);
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, isAuthenticated: !!user, isAuthLoading,
      isLoginModalOpen, isRegisterModalOpen,
      openLoginModal: () => {
        if (typeof window !== 'undefined') {
          const current = window.location.pathname + window.location.search;
          if (current && current !== '/' && !current.startsWith('/login')) {
            router.push(`/login?redirect=${encodeURIComponent(current)}`);
            return;
          }
        }
        router.push('/login');
      },
      closeLoginModal: () => setIsLoginModalOpen(false),
      openRegisterModal: () => router.push('/register'),
      closeRegisterModal: () => setIsRegisterModalOpen(false),
      openAuthPrompt,
      closeAuthPrompt,
      requireAuth
    }}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        {children}
        <AuthPromptModal
          isOpen={authPrompt.isOpen}
          onClose={closeAuthPrompt}
          options={authPrompt.options}
        />
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
