import { z } from 'zod';

export const recordHarvestSchema = z.object({
    harvestType: z.string().min(1, 'نوع الحصاد مطلوب'),
    harvestDate: z.string().optional(),
    totalQuantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
    unit: z.string().min(1, 'وحدة القياس مطلوبة'),
    hiveId: z.string().uuid('معرف الخلية غير صالح').optional(),
    notes: z.string().optional(),
});

export const recordHoneySchema = z.object({
    date: z.string().optional(),
    items: z.array(z.object({
        hiveId: z.string().uuid('معرف الخلية غير صالح'),
        quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
        unit: z.string().optional(),
    })).optional(),
    notes: z.string().optional(),
});
