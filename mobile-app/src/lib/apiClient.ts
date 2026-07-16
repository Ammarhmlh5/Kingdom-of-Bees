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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await setSetting('auth_token', '');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
