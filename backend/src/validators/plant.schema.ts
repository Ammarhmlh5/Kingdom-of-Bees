import { z } from 'zod';

export const addLocalPlantSchema = z.object({
  plantId: z.string().uuid(),
  coverage: z.number().positive(),
  coverageUnit: z.enum(['HECTARES', 'TREES', 'PATCHES', 'PERCENTAGE']),
  distanceKm: z.number().min(0).optional(),
  direction: z.string().optional(),
  bloomStartDate: z.string().datetime().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.bloomStartDate && data.distanceKm !== undefined && data.distanceKm < 0) return false;
  return true;
});

export const updateLocalPlantSchema = z.object({
  bloomStartDate: z.string().datetime().optional(),
  bloomEndDate: z.string().datetime().optional(),
  distanceKm: z.number().min(0).optional(),
  direction: z.string().optional(),
  coverage: z.number().positive().optional(),
  coverageUnit: z.enum(['HECTARES', 'TREES', 'PATCHES', 'PERCENTAGE']).optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.bloomEndDate && data.bloomStartDate && data.bloomEndDate < data.bloomStartDate) return false;
  return true;
}, { message: 'تاريخ نهاية الإزهار يجب أن يكون بعد تاريخ البداية' });

export const createPlantSchema = z.object({
  scientificName: z.string().min(1),
  commonNameAr: z.string().min(1),
  commonNameEn: z.string().optional(),
  localNames: z.array(z.string()).default([]),
  synonyms: z.array(z.string()).default([]),
  plantType: z.enum(['TREE', 'SHRUB', 'HERB', 'CROP', 'WILDFLOWER']),
  family: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  heightMinMeters: z.number().positive().optional(),
  heightMaxMeters: z.number().positive().optional(),
  beekeepingValue: z.any().optional(),
  flowering: z.any().optional(),
  environment: z.any().optional(),
  nativeRegions: z.array(z.string()).default([]),
  cultivatedRegions: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
});

export const updatePlantSchema = createPlantSchema.partial();
