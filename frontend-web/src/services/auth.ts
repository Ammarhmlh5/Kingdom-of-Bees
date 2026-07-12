
import api from './api';

export const verifyEmail = async (token: string) => ({ success: true });
export const sendVerificationEmail = async () => ({ success: true });
export const resetPassword = async (token: string, password: string) => ({ success: true });
export const forgotPassword = async (email: string) => ({ success: true });

// Plus the original object if used elsewhere? 
// No, mostly pages use one or the other.  
// auth.ts was mostly `authService`. 
// VerifyEmailPage, ResetPasswordPage use named imports.
// I will export BOTH named and the object to cover all bases.
// Or just export named functions and construct the object at the end.

export const login = async (email: string, password?: string) => {
    // We send password field. The backend now checks for password OR id for backward compat
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const generateInvite = async (apiaryId: string, role: string) => {
    const response = await api.post('/auth/invite', { apiaryId, role });
    return response.data;
};

export const joinApiary = async (inviteCode: string) => {
    const response = await api.post('/auth/join', { inviteCode });
    return response.data;
};

export const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'OWNER' | 'WORKER' | 'ADMIN';
}

export const authService = {
    login,
    generateInvite,
    joinApiary,
    register,
    resetPassword,
    verifyEmail,
    sendVerificationEmail
};
