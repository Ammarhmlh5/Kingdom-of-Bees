import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthService } from '@/lib/services/auth.service';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    setUser(result.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await AuthService.register(email, password, name);
    setUser(result.user);
  };

  const googleLogin = async (idToken: string) => {
    const result = await AuthService.googleLogin(idToken);
    setUser(result.user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const u = await AuthService.refreshUser();
    if (u) setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
