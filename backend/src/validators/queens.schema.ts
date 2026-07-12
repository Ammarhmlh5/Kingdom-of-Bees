import { z } from 'zod';

export const createQueenSchema = z.object({
    queenNumber: z.string().optional(),
    source: z.string().min(1, 'مصدر الملكة مطلوب'),
    beeBreedId: z.string().uuid('معرف السلالة غير صالح').optional(),
    birthDate: z.string().optional(),
    introductionDate: z.string().optional(),
    marked: z.boolean().optional(),
    markColor: z.string().optional(),
    hiveId: z.string().uuid('معرف الخلية غير صالح').optional(),
});
