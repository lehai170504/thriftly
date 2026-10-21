import axios from 'axios';

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
};

export const getCsrfToken = (): string | null => getCookie('XSRF-TOKEN');

const attachCsrfHeader = (config: any) => {
  const method = (config.method ?? 'get').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return config;
  }

  const token = getCsrfToken();
  if (!token) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers['X-XSRF-TOKEN'] = token;
  return config;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  attachCsrfHeader(config);

  if (typeof window !== 'undefined') {
    const consent = localStorage.getItem('thriftly-cookie-consent');
    if (consent) config.headers['X-Cookie-Consent'] = consent;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.dispatchEvent(new Event('thriftly:session-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
