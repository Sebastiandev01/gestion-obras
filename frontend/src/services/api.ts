import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

/* ============================
   Control de refresh
============================ */
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

/* ============================
   Axios base
============================ */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const access = localStorage.getItem('access');
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = localStorage.getItem('refresh');

      if (!refresh) {
        logoutUser();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ⚠️ axios plano (sin interceptores)
        const response = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh/`,
          { refresh },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccess = response.data.access;

        localStorage.setItem('access', newAccess);

        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ============================
   LOGOUT
============================ */
function logoutUser() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');

  store.dispatch(logout());
  window.location.href = '/login';
}

export default api;
