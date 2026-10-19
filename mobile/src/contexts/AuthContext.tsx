import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { storage } from '../lib/storage';
import { api, fetchCsrfToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data) {
        const u = {
          ...res.data,
          name: res.data.fullName || res.data.name || res.data.username,
          avatarUrl: res.data.avatar || res.data.avatarUrl,
        };
        setUser(u);
        await storage.setItem('user_info', JSON.stringify(u));
      }
    } catch {
    }
  };

  useEffect(() => {
    async function loadAuth() {
      try {
        await fetchCsrfToken();
        const storedUser = await storage.getItem('user_info');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          refreshUser();
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (newUser: User) => {
    const formattedUser = {
      ...newUser,
      name: newUser.fullName || newUser.name || newUser.username,
      avatarUrl: newUser.avatar || newUser.avatarUrl,
    };
    setUser(formattedUser);
    await storage.setItem('user_info', JSON.stringify(formattedUser));
    await refreshUser();
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem('session_cookie');
    await storage.removeItem('user_info');
    try {
      await api.post('/auth/logout');
    } catch {
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    storage.setItem('user_info', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
