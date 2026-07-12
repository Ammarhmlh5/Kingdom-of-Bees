import { z } from 'zod';

export const createHiveTemplateSchema = z.object({
    name: z.string().min(1, 'الاسم مطلوب'),
    type: z.string().min(1, 'النوع مطلوب'),
    frames: z.number().int().min(1, 'عدد الإطارات يجب أن يكون 1 على الأقل').optional(),
    notes: z.string().optional(),
});
