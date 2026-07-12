/**
 * Disease Database Index
 * فهرس قاعدة بيانات الأمراض
 */

import type { Disease } from '../../types/disease';
import { broodDiseases } from './brood-diseases';
import { adultDiseases } from './adult-diseases';

/**
 * جميع الأمراض
 */
export const allDiseases: Disease[] = [
  ...broodDiseases,
  ...adultDiseases,
];

/**
 * تصدير الأمراض حسب الفئة
 */
export { broodDiseases } from './brood-diseases';
export { adultDiseases } from './adult-diseases';

/**
 * تصدير الأمراض الفردية
 */
export {
  americanFoulbrood,
  europeanFoulbrood,
  chalkbrood,
  sacbrood,
} from './brood-diseases';

export {
  nosema,
  amoeba,
  paralysis,
} from './adult-diseases';

/**
 * الحصول على مرض بواسطة المعرف
 */
export function getDiseaseById(id: string): Disease | undefined {
  return allDiseases.find((disease) => disease.id === id);
}

/**
 * الحصول على الأمراض حسب الفئة
 */
export function getDiseasesByCategory(category: Disease['category']): Disease[] {
  return allDiseases.filter((disease) => disease.category === category);
}

/**
 * البحث عن الأمراض
 */
export function searchDiseases(query: string, locale: 'ar' | 'en' | 'fr' = 'ar'): Disease[] {
  const lowerQuery = query.toLowerCase();
  
  return allDiseases.filter((disease) => {
    const name = disease.name[locale]?.toLowerCase() || '';
    const scientificName = disease.scientificName.toLowerCase();
    const description = disease.description[locale]?.toLowerCase() || '';
    
    return (
      name.includes(lowerQuery) ||
      scientificName.includes(lowerQuery) ||
      description.includes(lowerQuery)
    );
  });
}
