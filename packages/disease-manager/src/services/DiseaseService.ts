/**
 * Disease Database Service
 * خدمة قاعدة بيانات الأمراض
 */

import type { Disease, DiseaseFilter, DiseaseStatistics } from '../types/disease';
import { allDiseases, getDiseaseById as getById, getDiseasesByCategory, searchDiseases } from '../data/diseases';
import type { SupportedLocale } from '../i18n/types';

/**
 * خدمة قاعدة بيانات الأمراض
 */
export class DiseaseService {
  /**
   * الحصول على جميع الأمراض مع فلترة اختيارية
   */
  getDiseases(filter?: DiseaseFilter): Disease[] {
    let diseases = [...allDiseases];

    // تطبيق الفلاتر
    if (filter) {
      // فلتر حسب الفئة
      if (filter.category) {
        diseases = diseases.filter((d) => d.category === filter.category);
      }

      // فلتر حسب مستوى الخطورة
      if (filter.severity) {
        diseases = diseases.filter((d) => d.severity === filter.severity);
      }

      // فلتر حسب الموسم
      if (filter.season) {
        diseases = diseases.filter((d) => d.seasonality.includes(filter.season!));
      }

      // فلتر حسب المنطقة
      if (filter.region) {
        diseases = diseases.filter((d) =>
          d.regions.includes(filter.region!) || d.regions.includes('worldwide')
        );
      }

      // البحث النصي
      if (filter.search) {
        const locale: SupportedLocale = 'ar'; // يمكن تمريرها كمعامل
        diseases = searchDiseases(filter.search, locale);
      }

      // الترتيب
      if (filter.orderBy) {
        diseases = this.sortDiseases(diseases, filter.orderBy, filter.orderDirection || 'asc');
      }

      // الحد والإزاحة
      if (filter.offset !== undefined) {
        diseases = diseases.slice(filter.offset);
      }

      if (filter.limit !== undefined) {
        diseases = diseases.slice(0, filter.limit);
      }
    }

    return diseases;
  }

  /**
   * الحصول على مرض بواسطة المعرف
   */
  getDiseaseById(id: string): Disease | undefined {
    return getById(id);
  }

  /**
   * البحث عن الأمراض
   */
  searchDiseases(query: string, locale: SupportedLocale = 'ar'): Disease[] {
    return searchDiseases(query, locale);
  }

  /**
   * الحصول على الأمراض حسب الفئة
   */
  getDiseasesByCategory(category: Disease['category']): Disease[] {
    return getDiseasesByCategory(category);
  }

  /**
   * الحصول على الأمراض حسب مستوى الخطورة
   */
  getDiseasesBySeverity(severity: Disease['severity']): Disease[] {
    return allDiseases.filter((d) => d.severity === severity);
  }

  /**
   * الحصول على الأمراض حسب الموسم
   */
  getDiseasesBySeason(season: Disease['seasonality'][0]): Disease[] {
    return allDiseases.filter((d) => d.seasonality.includes(season));
  }

  /**
   * الحصول على الأمراض الأكثر انتشاراً
   */
  getMostPrevalentDiseases(limit: number = 10): Disease[] {
    return [...allDiseases]
      .filter((d) => d.prevalence !== undefined)
      .sort((a, b) => (b.prevalence || 0) - (a.prevalence || 0))
      .slice(0, limit);
  }

  /**
   * الحصول على الأمراض الأكثر خطورة
   */
  getMostDangerousDiseases(limit: number = 10): Disease[] {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return [...allDiseases]
      .sort((a, b) => {
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;

        // إذا كان مستوى الخطورة متساوياً، رتب حسب معدل الوفيات
        return (b.mortalityRate || 0) - (a.mortalityRate || 0);
      })
      .slice(0, limit);
  }

  /**
   * الحصول على إحصائيات مرض
   * ملاحظة: هذه دالة نموذجية، في التطبيق الفعلي ستحصل على البيانات من قاعدة البيانات
   */
  getDiseaseStatistics(diseaseId: string): DiseaseStatistics | undefined {
    const disease = this.getDiseaseById(diseaseId);
    if (!disease) return undefined;

    // بيانات نموذجية - في التطبيق الفعلي ستأتي من قاعدة البيانات
    return {
      diseaseId,
      totalCases: 0,
      activeCases: 0,
      treatedCases: 0,
      successRate: 0,
      averageTreatmentDuration: 0,
      geographicDistribution: [],
      seasonalDistribution: [],
    };
  }

  /**
   * الحصول على الأمراض المرتبطة
   */
  getRelatedDiseases(diseaseId: string, limit: number = 5): Disease[] {
    const disease = this.getDiseaseById(diseaseId);
    if (!disease) return [];

    // الأمراض من نفس الفئة
    const sameCategoryDiseases = this.getDiseasesByCategory(disease.category)
      .filter((d) => d.id !== diseaseId);

    // الأمراض بنفس مستوى الخطورة
    const sameSeverityDiseases = this.getDiseasesBySeverity(disease.severity)
      .filter((d) => d.id !== diseaseId && d.category !== disease.category);

    // دمج النتائج
    const related = [...sameCategoryDiseases, ...sameSeverityDiseases];

    // إزالة التكرارات
    const unique = Array.from(new Map(related.map((d) => [d.id, d])).values());

    return unique.slice(0, limit);
  }

  /**
   * الحصول على عدد الأمراض
   */
  getDiseaseCount(filter?: DiseaseFilter): number {
    return this.getDiseases(filter).length;
  }

  /**
   * الحصول على الفئات المتاحة
   */
  getAvailableCategories(): Disease['category'][] {
    const categories = new Set(allDiseases.map((d) => d.category));
    return Array.from(categories);
  }

  /**
   * الحصول على المواسم المتاحة
   */
  getAvailableSeasons(): Disease['seasonality'][0][] {
    const seasons = new Set<Disease['seasonality'][0]>();
    allDiseases.forEach((d) => {
      d.seasonality.forEach((s) => seasons.add(s));
    });
    return Array.from(seasons);
  }

  /**
   * الحصول على المناطق المتاحة
   */
  getAvailableRegions(): string[] {
    const regions = new Set<string>();
    allDiseases.forEach((d) => {
      d.regions.forEach((r) => regions.add(r));
    });
    return Array.from(regions);
  }

  /**
   * ترتيب الأمراض
   */
  private sortDiseases(
    diseases: Disease[],
    orderBy: 'name' | 'severity' | 'prevalence',
    direction: 'asc' | 'desc'
  ): Disease[] {
    const sorted = [...diseases];
    const multiplier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (orderBy) {
        case 'name':
          comparison = a.name.ar.localeCompare(b.name.ar, 'ar');
          break;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'prevalence':
          comparison = (a.prevalence || 0) - (b.prevalence || 0);
          break;
      }

      return comparison * multiplier;
    });

    return sorted;
  }

  /**
   * التحقق من وجود مرض
   */
  diseaseExists(id: string): boolean {
    return this.getDiseaseById(id) !== undefined;
  }

  /**
   * الحصول على جميع الأعراض من جميع الأمراض
   */
  getAllSymptoms(): Array<{ diseaseId: string; symptom: Disease['symptoms'][0] }> {
    const symptoms: Array<{ diseaseId: string; symptom: Disease['symptoms'][0] }> = [];

    allDiseases.forEach((disease) => {
      disease.symptoms.forEach((symptom) => {
        symptoms.push({ diseaseId: disease.id, symptom });
      });
    });

    return symptoms;
  }

  /**
   * البحث عن الأمراض بواسطة الأعراض
   */
  findDiseasesBySymptoms(symptomIds: string[]): Disease[] {
    return allDiseases.filter((disease) => {
      const diseaseSymptomIds = disease.symptoms.map((s) => s.id);
      return symptomIds.some((id) => diseaseSymptomIds.includes(id));
    });
  }
  /**
   * الحصول على إحصائيات عامة
   */
  getStatistics(): { total: number } {
    return {
      total: allDiseases.length,
    };
  }
}

/**
 * إنشاء مثيل من خدمة الأمراض
 */
export function createDiseaseService(): DiseaseService {
  return new DiseaseService();
}

/**
 * مثيل افتراضي من الخدمة
 */
export const diseaseService = createDiseaseService();
