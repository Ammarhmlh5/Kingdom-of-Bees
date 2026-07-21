import apiClient from '../apiClient';
import { getSetting, setSetting } from '../db';
import type { User } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const result = data.data || data;
    const authToken = result.accessToken || result.token;
    if (authToken) {
      await setSetting('auth_token', authToken);
    }
    if (result.user) {
      await setSetting('user', JSON.stringify(result.user));
    }
    return { user: result.user, token: authToken };
  }

  static async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post('/auth/register', { email, password, name });
    const result = data.data || data;
    const authToken = result.accessToken || result.token;
    if (authToken) {
      await setSetting('auth_token', authToken);
    }
    if (result.user) {
      await setSetting('user', JSON.stringify(result.user));
    }
    return { user: result.user, token: authToken };
  }

  static async googleLogin(idToken: string): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post('/auth/google', { idToken });
    const result = data.data || data;
    const authToken = result.accessToken || result.token;
    if (authToken) {
      await setSetting('auth_token', authToken);
    }
    if (result.user) {
      await setSetting('user', JSON.stringify(result.user));
    }
    return { user: result.user, token: authToken };
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    await setSetting('auth_token', '');
    await setSetting('user', '');
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = await getSetting('auth_token');
    if (!token) return null;
    try {
      const userStr = await getSetting('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      return null;
    }
    return null;
  }

  static async refreshUser(): Promise<User | null> {
    try {
      const { data } = await apiClient.get('/auth/me');
      const user = data.data || data;
      if (user) {
        await setSetting('user', JSON.stringify(user));
        return user;
      }
    } catch {
      return null;
    }
    return null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await getSetting('auth_token');
    return !!token;
  }
}
