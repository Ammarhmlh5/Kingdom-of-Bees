import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    userType: z.enum(['OWNER', 'WORKER', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const googleAuthSchema = z.object({
    googleId: z.string().min(1, 'Google ID مطلوب'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    fullName: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const inviteSchema = z.object({
    apiaryId: z.string().uuid('معرف المنحل غير صالح'),
    role: z.enum(['WORKER', 'VIEWER']).optional().default('WORKER'),
});

export const joinSchema = z.object({
    inviteCode: z.string().min(1, 'رمز الدعوة مطلوب'),
});
