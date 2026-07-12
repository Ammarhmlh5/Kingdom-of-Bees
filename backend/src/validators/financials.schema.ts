import { z } from 'zod';

export const createFinancialRecordSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE'], 'النوع يجب أن يكون إيراد أو مصروف'),
    amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
    category: z.string().min(1, 'الفئة مطلوبة'),
    description: z.string().optional(),
    recordDate: z.string().min(1, 'التاريخ مطلوب'),
});
