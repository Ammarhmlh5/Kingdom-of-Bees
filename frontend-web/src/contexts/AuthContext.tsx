import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL, setAuthData, clearAuthData, getAuthToken, getCurrentUser } from '@/config';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'OWNER' | 'WORKER' | 'EXPLORER';
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (googleUser: { googleId: string; email: string; fullName: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
    register: (data: { email: string; password: string; fullName: string; userType: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = getAuthToken();
        const savedUser = getCurrentUser();

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'فشل تسجيل الدخول' };
            }

            const { accessToken, user: userData } = data;
            setAuthData(accessToken, userData);
            setToken(accessToken);
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'خطأ في الاتصال بالسيرفر' };
        }
    };

    const register = async (data: { email: string; password: string; fullName: string; userType: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                return { success: false, error: responseData.error || 'فشل إنشاء الحساب' };
            }

            const { accessToken, user: userData } = responseData;
            setAuthData(accessToken, userData);
            setToken(accessToken);
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'خطأ في الاتصال بالسيرفر' };
        }
    };

    const loginWithGoogle = async (googleUser: { googleId: string; email: string; fullName: string; avatarUrl?: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleUser),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'فشل تسجيل الدخول عبر Google' };
            }

            const { accessToken, user: userData } = data;
            setAuthData(accessToken, userData);
            setToken(accessToken);
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'خطأ في الاتصال بالسيرفر' };
        }
    };

    const logout = () => {
        // Clear auth data
        clearAuthData();
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear apiary context
        localStorage.removeItem('currentApiaryId');
        localStorage.removeItem('lastVisitedApiaryId');
        localStorage.removeItem('lastApiaryRoute');

        setToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        isOwner: user?.role === 'OWNER',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
