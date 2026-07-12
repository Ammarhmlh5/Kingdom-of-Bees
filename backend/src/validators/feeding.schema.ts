import { z } from 'zod';

export const feedHiveSchema = z.object({
    hiveId: z.string().uuid('معرف الخلية غير صالح'),
    feedingDate: z.string().optional(),
    feedingLocation: z.string().optional(),
    contentType: z.string().min(1, 'نوع التغذية مطلوب'),
    quantityKg: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
    purpose: z.string().optional(),
    notes: z.string().optional(),
});

export const feedApiarySchema = z.object({
    feedingDate: z.string().optional(),
    feedingLocation: z.string().optional(),
    contentType: z.string().min(1, 'نوع التغذية مطلوب'),
    quantityKg: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
    purpose: z.string().optional(),
    notes: z.string().optional(),
});
