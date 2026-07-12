import { z } from 'zod';

export const runSimulationSchema = z.object({
    scope: z.enum(['HIVE', 'HIVES', 'APIARY'], 'نطاق المحاكاة يجب أن يكون HIVE أو HIVES أو APIARY'),
    hiveIds: z.array(z.string().uuid('معرف الخلية غير صالح')).optional(),
    duration: z.number().int().min(1, 'المدة يجب أن تكون شهراً واحداً على الأقل').optional(),
    factors: z.object({
        includeWeather: z.boolean().optional(),
        includeBeekeeper: z.boolean().optional(),
        includeSeasons: z.boolean().optional(),
    }).optional(),
});
