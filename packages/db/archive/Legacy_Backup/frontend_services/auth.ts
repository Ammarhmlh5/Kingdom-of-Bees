import { API_URL, fetchWithAuth } from '@/config';

/**
 * Request password reset email
 * @param email - User's email address
 */
export async function forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send reset email');
    return response.json();
}

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param newPassword - New password
 */
export async function resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return response.json();
}

/**
 * Refresh JWT token
 */
export async function refreshToken() {
    const response = await fetchWithAuth(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json();
}

/**
 * Logout user
 */
export async function logout() {
    const response = await fetchWithAuth(`${API_URL}/auth/logout`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to logout');
    return response.json();
}

/**
 * Verify email with token
 * @param token - Verification token from email
 */
export async function verifyEmail(token: string) {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Failed to verify email');
    return response.json();
}

/**
 * Send verification email
 */
export async function sendVerificationEmail() {
    const response = await fetchWithAuth(`${API_URL}/auth/send-verification`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to send verification email');
    return response.json();
}

/**
 * Login user
 * @param email - User's email
 * @param password - User's password
 */
export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
}

/**
 * Register new user
 * @param data - Registration data
 */
export async function register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    userType?: string;
}) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
    const response = await fetchWithAuth(`${API_URL}/auth/me`);
    if (!response.ok) throw new Error('Failed to get user profile');
    return response.json();
}
