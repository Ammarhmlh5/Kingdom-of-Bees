import { z } from 'zod';

export const createHiveSchema = z.object({
    hiveNumber: z.string().min(1, 'رقم الخلية مطلوب'),
    hiveType: z.string().min(1, 'نوع الخلية مطلوب'),
    hiveTypeId: z.string().uuid('معرف نوع الخلية غير صالح').optional(),
    status: z.string().optional(),
    queenId: z.string().uuid('معرف الملكة غير صالح').optional(),
    name: z.string().optional(),
    queenAge: z.number().int().min(0).optional(),
    queenColor: z.string().optional(),
    framesPerBox: z.number().int().min(1).optional(),
    notes: z.string().optional(),
});

export const updateHiveSchema = z.object({
    hiveNumber: z.string().optional(),
    hiveType: z.string().optional(),
    hiveTypeId: z.string().uuid('معرف نوع الخلية غير صالح').optional(),
    status: z.string().optional(),
    queenId: z.string().uuid('معرف الملكة غير صالح').optional(),
    name: z.string().optional(),
    queenAge: z.number().int().min(0).optional(),
    queenColor: z.string().optional(),
    framesPerBox: z.number().int().min(1).optional(),
    notes: z.string().optional(),
});

export const updateFramesSchema = z.object({
    frames: z.array(z.any()).min(1, 'يجب توفير إطار واحد على الأقل'),
});

export const splitHiveSchema = z.object({
    newHiveNumber: z.string().min(1, 'رقم الخلية الجديدة مطلوب'),
    framesTransferred: z.array(z.any()).min(1, 'يجب تحديد الإطارات المنقولة'),
    queenLocation: z.string().min(1, 'يجب تحديد موقع الملكة'),
});

export const mergeHivesSchema = z.object({
    targetHiveId: z.string().uuid('معرف الخلية الهدف غير صالح'),
    mergeMethod: z.string().min(1, 'طريقة الدمج مطلوبة'),
    queenKept: z.string().min(1, 'يجب تحديد الملكة المحتفظ بها'),
});

export const addSuperSchema = z.object({
    operationType: z.string().min(1, 'نوع العملية مطلوب'),
    framesInSuper: z.number().int().min(1, 'يجب تحديد عدد الإطارات في العاسلة'),
});

export const setupHiveSchema = z.object({
    hiveNumber: z.string().optional(),
    type: z.string().optional(),
    hiveType: z.string().optional(),
    queen: z.object({
        breed: z.string().optional(),
        source: z.string().optional(),
        year: z.string().optional(),
        isMarked: z.boolean().optional(),
        markColor: z.string().optional(),
    }).optional(),
    strength: z.string().optional(),
    frames: z.object({
        total: z.number().int().min(0).optional(),
        brood: z.number().int().min(0).optional(),
        honey: z.number().int().min(0).optional(),
        pollen: z.number().int().min(0).optional(),
    }).optional(),
});
