import { z } from 'zod';

export const createApiarySchema = z.object({
    name: z.string().min(2, 'اسم المنحل يجب أن يكون حرفين على الأقل'),
    location: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    type: z.string().optional(),
    locationLat: z.number().optional(),
    locationLng: z.number().optional(),
    establishedDate: z.string().optional(),
    workerCount: z.number().optional(),
    isPublic: z.boolean().optional(),

    // Hive configuration
    initialHiveCount: z.number().int().min(0).optional(),
    hivesConfig: z.array(z.object({
        templateId: z.string(),
        count: z.number().int().min(1),
    })).optional(),
    hivesCounts: z.object({
        langstroth: z.number().int().min(0).optional(),
        traditional: z.number().int().min(0).optional(),
        nuc: z.number().int().min(0).optional(),
    }).optional(),
});

export const updateApiarySchema = z.object({
    name: z.string().min(2).optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    locationLat: z.number().optional(),
    locationLng: z.number().optional(),
    address: z.string().optional(),
    type: z.string().optional(),
    isPublic: z.boolean().optional(),
});
