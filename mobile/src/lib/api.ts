import axios from 'axios';
import { storage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://thriftly-backend.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let csrfTokenPromise: Promise<string | null> | null = null;

export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get(`${API_URL}/auth/csrf`, { withCredentials: true });
    const token = res.data?.token;
    if (token) {
      await storage.setItem('xsrf_token', token);
      return token;
    }
  } catch {
  }
  return null;
}

api.interceptors.request.use(async (config) => {
  const sessionCookie = await storage.getItem('session_cookie');
  if (sessionCookie) {
    config.headers.Cookie = sessionCookie;
  }

  let xsrf = await storage.getItem('xsrf_token');
  const method = config.method?.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method || '')) {
    if (!xsrf) {
      if (!csrfTokenPromise) {
        csrfTokenPromise = fetchCsrfToken().finally(() => {
          csrfTokenPromise = null;
        });
      }
      xsrf = await csrfTokenPromise;
    }
    if (xsrf) {
      config.headers['X-XSRF-TOKEN'] = xsrf;
    }
  }

  return config;
});

api.interceptors.response.use(
  async (response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
      await storage.setItem('session_cookie', cookieStr);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('session_cookie');
      await storage.removeItem('user_info');
    }
    return Promise.reject(error);
  }
);

export default api;
