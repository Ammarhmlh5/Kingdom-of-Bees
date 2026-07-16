import apiClient from '../apiClient';
import { getSetting, setSetting } from '../db';
import type { User } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const result = data.data || data;
    if (result.token) {
      await setSetting('auth_token', result.token);
    }
    if (result.user) {
      await setSetting('user', JSON.stringify(result.user));
    }
    return result;
  }

  static async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post('/auth/register', { email, password, name });
    const result = data.data || data;
    if (result.token) {
      await setSetting('auth_token', result.token);
    }
    if (result.user) {
      await setSetting('user', JSON.stringify(result.user));
    }
    return result;
  }

  static async logout(): Promise<void> {
    await setSetting('auth_token', '');
    await setSetting('user', '');
  }

  static async getCurrentUser(): Promise<User | null> {
    const userStr = await getSetting('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await getSetting('auth_token');
    return !!token;
  }
}
