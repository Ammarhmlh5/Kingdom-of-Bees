import { z } from 'zod';

export const upsertInspectionSettingSchema = z.object({
    type: z.string().min(1, 'نوع الفحص مطلوب'),
    nameAr: z.string().optional(),
    minInterval: z.number().int().min(0, 'الحد الأدنى يجب أن يكون 0 على الأقل'),
    maxInterval: z.number().int().min(1, 'الحد الأقصى يجب أن يكون 1 على الأقل'),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
});

export const updateInspectionSettingSchema = z.object({
    nameAr: z.string().optional(),
    minInterval: z.number().int().min(0).optional(),
    maxInterval: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
});

export const createInspectionScheduleSchema = z.object({
    hiveId: z.string().uuid('معرف الخلية غير صالح'),
    settingId: z.string().uuid('معرف الإعداد غير صالح'),
    scheduledDate: z.string().min(1, 'التاريخ المجدول مطلوب'),
    notes: z.string().optional(),
});

export const validateInspectionDateSchema = z.object({
    type: z.string().min(1, 'نوع الفحص مطلوب'),
    inspectionDate: z.string().min(1, 'تاريخ الفحص مطلوب'),
});

export const recordInspectionSchema = z.object({
    inspectionDate: z.string().min(1, 'تاريخ الفحص مطلوب'),
    hiveStrength: z.string().optional(),
    queenSeen: z.boolean().optional(),
    eggsSeen: z.boolean().optional(),
    broodPattern: z.string().optional(),
    honeyStores: z.string().optional(),
    pollenStores: z.string().optional(),
    diseaseSigns: z.string().optional(),
    notes: z.string().optional(),
});
