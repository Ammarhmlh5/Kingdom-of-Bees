/**
 * فهرس قاعدة بيانات العلاجات
 * Treatments Database Index
 */

import { Treatment, TreatmentType } from '../../types/treatment';
import { chemicalTreatments } from './chemical-treatments';
import { organicTreatments } from './organic-treatments';
import { biologicalMechanicalTreatments } from './biological-mechanical-treatments';

/**
 * جميع العلاجات
 * All Treatments
 */
export const allTreatments: Treatment[] = [
  ...chemicalTreatments,
  ...organicTreatments,
  ...biologicalMechanicalTreatments,
];

/**
 * الحصول على علاج بواسطة المعرف
 * Get treatment by ID
 */
export function getTreatmentById(id: string): Treatment | undefined {
  return allTreatments.find((treatment) => treatment.id === id);
}

/**
 * الحصول على العلاجات حسب النوع
 * Get treatments by type
 */
export function getTreatmentsByType(type: TreatmentType): Treatment[] {
  return allTreatments.filter((treatment) => treatment.type === type);
}

/**
 * الحصول على العلاجات حسب المرض المستهدف
 * Get treatments by target disease
 */
export function getTreatmentsByDisease(diseaseId: string): Treatment[] {
  return allTreatments.filter((treatment) =>
    treatment.targetDiseases.includes(diseaseId)
  );
}

/**
 * البحث في العلاجات
 * Search treatments
 */
export function searchTreatments(query: string, locale: 'ar' | 'en' | 'fr' = 'ar'): Treatment[] {
  const lowerQuery = query.toLowerCase();
  return allTreatments.filter((treatment) => {
    const name = (treatment.name[locale] || treatment.name.en).toLowerCase();
    const description = (treatment.description[locale] || treatment.description.en).toLowerCase();
    const tradeName = (treatment.tradeName?.[locale] || treatment.tradeName?.en || '').toLowerCase();
    const activeIngredient = (treatment.activeIngredient?.[locale] || treatment.activeIngredient?.en || '').toLowerCase();

    return (
      name.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      tradeName.includes(lowerQuery) ||
      activeIngredient.includes(lowerQuery)
    );
  });
}

// تصدير قواعد البيانات الفردية
export { chemicalTreatments, organicTreatments, biologicalMechanicalTreatments };
