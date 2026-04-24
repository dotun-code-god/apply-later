import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './token-store';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  queue.forEach((fn) => fn(token));
  queue = [];
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrf = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('csrf_token='))
    ?.split('=')[1];

  if (csrf) {
    config.headers['x-csrf-token'] = decodeURIComponent(csrf);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const response = await apiClient.post('/auth/refresh');
      const newToken = (response.data as { accessToken?: string }).accessToken ?? null;
      tokenStore.setAccessToken(newToken);
      resolveQueue(newToken);

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
      }

      return apiClient(original);
    } catch (refreshError) {
      tokenStore.clear();
      resolveQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
