/* eslint-disable @typescript-eslint/no-explicit-any */
import api, { getCsrfToken } from '@/lib/axios';
import { AuthResponse } from '../types/auth';

let csrfRequest: Promise<void> | null = null;

const prepareCsrf = async (): Promise<void> => {
  if (typeof window !== 'undefined' && getCsrfToken()) {
    api.defaults.headers.common['X-XSRF-TOKEN'] = getCsrfToken();
    return;
  }

  if (!csrfRequest) {
    csrfRequest = api.get('/auth/csrf')
      .then((response) => {
        const token = response.data?.token ?? getCsrfToken();
        if (token) {
          api.defaults.headers.common['X-XSRF-TOKEN'] = token;
        }
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  await csrfRequest;
};

const post = async <T>(url: string, data?: unknown): Promise<T> => {
  await prepareCsrf();
  return (await api.post<T>(url, data)).data;
};

export const authApi = {
  prepareCsrf,
  me: async (): Promise<AuthResponse> => (await api.get<AuthResponse>('/users/me')).data,
  login: (data: any) => post<AuthResponse>('/auth/login', data),
  verify2Fa: (data: { email: string; otp: string }) => post<AuthResponse>('/auth/verify-2fa', data),
  googleLogin: (credential: string) => post<AuthResponse>('/auth/google-login', { credential }),
  facebookLogin: (accessToken: string) => post<AuthResponse>('/auth/facebook-login', { accessToken }),
  register: (data: any) => post<AuthResponse>('/auth/register', data),
  logout: () => post<void>('/auth/logout'),
  logoutAll: () => post<void>('/auth/logout-all'),
  forgotPassword: (email: string) => post<any>('/auth/forgot-password', { email }),
  resetPassword: (data: any) => post<any>('/auth/reset-password', data),
};
