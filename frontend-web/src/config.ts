// Configuration for Kingdom of Bees Frontend
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "مملكة النحل";

// Auth token management
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

// Get current user from localStorage
export function getCurrentUser(): any | null {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    try {
        return JSON.parse(user);
    } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
        return null;
    }
}

// Set auth data
export function setAuthData(token: string, user: any): void {
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear auth data
export function clearAuthData(): void {
    removeAuthToken();
    localStorage.removeItem('user');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

// Fetch with auth header
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
    }

    return response;
};
