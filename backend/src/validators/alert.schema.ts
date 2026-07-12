import { z } from 'zod';

export const createAlertSchema = z.object({
    alertType: z.string().min(1, 'نوع التنبيه مطلوب'),
    title: z.string().min(1, 'عنوان التنبيه مطلوب'),
    message: z.string().min(1, 'رسالة التنبيه مطلوبة'),
    apiaryId: z.string().uuid('معرف المنحل غير صالح').optional(),
    hiveId: z.string().uuid('معرف الخلية غير صالح').optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
    userId: z.string().uuid('معرف المستخدم غير صالح').optional(),
    actionRequired: z.boolean().optional(),
    actionUrl: z.string().optional(),
    actionDeadline: z.string().optional(),
    expiresAt: z.string().optional(),
});
