import axios from 'axios';
import { getSetting, setSetting } from './db';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getSetting('auth_token');
  if (!token) {
    console.warn('[API] No auth token found — request may fail');
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`[API] ERROR ${status} ${url}:`, error.response?.data || error.message);

    if (status === 401) {
      console.warn('[API] 401 Unauthorized — clearing token and redirecting to login');
      await setSetting('auth_token', '');
      await setSetting('user', '');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
