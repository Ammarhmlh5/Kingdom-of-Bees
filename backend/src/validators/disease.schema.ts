import { z } from 'zod';

export const reportOutbreakSchema = z.object({
    diseaseId: z.string().uuid('معرف المرض غير صالح'),
    hiveIds: z.array(z.string().uuid('معرف الخلية غير صالح')).min(1, 'يجب تحديد خلية واحدة على الأقل'),
    date: z.string().optional(),
    notes: z.string().optional(),
    treatmentId: z.string().uuid('معرف العلاج غير صالح').optional(),
});

export const resolveDiseaseSchema = z.object({
    outcome: z.string().optional(),
});

export const createDiseaseSchema = z.object({
    nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
    nameEn: z.string().min(1, 'الاسم بالإنجليزية مطلوب'),
    scientificName: z.string().optional(),
    diseaseType: z.enum(['PARASITIC', 'BACTERIAL', 'VIRAL', 'FUNGAL', 'ENVIRONMENTAL', 'OTHER']).optional(),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL']).optional(),
    contagiousness: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    mortalityRate: z.number().min(0).max(100).optional(),
    symptoms: z.array(z.string()).optional(),
    diagnosisMethods: z.array(z.string()).optional(),
    treatable: z.boolean().optional(),
    burningRequired: z.boolean().optional(),
    quarantineRequired: z.boolean().optional(),
    quarantineDurationDays: z.number().int().min(0).optional(),
    reportingMandatory: z.boolean().optional(),
    preventionMethods: z.array(z.string()).optional(),
});

export const updateDiseaseSchema = createDiseaseSchema.partial();

export const createTreatmentSchema = z.object({
    nameAr: z.string().min(1, 'اسم العلاج بالعربية مطلوب'),
    nameEn: z.string().min(1, 'اسم العلاج بالإنجليزية مطلوب'),
    description: z.string().optional(),
    type: z.enum(['CHEMICAL', 'ORGANIC', 'BIOLOGICAL', 'MECHANICAL', 'OTHER']).optional(),
    applicationMethod: z.string().optional(),
    dosage: z.string().optional(),
    durationDays: z.number().int().min(0).optional(),
    frequency: z.string().optional(),
    season: z.array(z.string()).optional(),
    temperatureMin: z.number().optional(),
    temperatureMax: z.number().optional(),
    honeySafe: z.boolean().optional(),
    withdrawalPeriod: z.number().int().min(0).optional(),
    effectiveness: z.string().optional(),
});

export const updateTreatmentSchema = createTreatmentSchema.partial();
