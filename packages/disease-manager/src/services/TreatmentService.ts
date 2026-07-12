/**
 * خدمة قاعدة بيانات العلاجات
 * Treatment Database Service
 */

import {
  Treatment,
  TreatmentFilter,
  TreatmentStatistics,
  TreatmentType,
  ApplicationMethod,
} from '../types/treatment';
import { allTreatments } from '../data/treatments';

/**
 * خدمة العلاجات
 * Treatment Service
 */
export class TreatmentService {
  /**
   * الحصول على جميع العلاجات مع فلترة اختيارية
   * Get all treatments with optional filtering
   */
  static getTreatments(filter?: TreatmentFilter): Treatment[] {
    let treatments = [...allTreatments];

    if (!filter) {
      return treatments;
    }

    // فلترة حسب النوع
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      treatments = treatments.filter((t) => types.includes(t.type));
    }

    // فلترة حسب طريقة التطبيق
    if (filter.applicationMethod) {
      const methods = Array.isArray(filter.applicationMethod)
        ? filter.applicationMethod
        : [filter.applicationMethod];
      treatments = treatments.filter((t) => methods.includes(t.applicationMethod));
    }

    // فلترة حسب المرض المستهدف
    if (filter.targetDisease) {
      treatments = treatments.filter((t) =>
        t.targetDiseases.includes(filter.targetDisease!)
      );
    }

    // فلترة حسب الحد الأدنى للفعالية
    if (filter.minEffectiveness) {
      treatments = treatments.filter((t) => t.effectiveness >= filter.minEffectiveness!);
    }

    // فلترة العلاجات العضوية فقط
    if (filter.organicOnly) {
      treatments = treatments.filter((t) => t.organicCertified === true);
    }

    // فلترة العلاجات الآمنة للعسل فقط
    if (filter.safeForHoneyOnly) {
      treatments = treatments.filter((t) => t.safeForHoney === true);
    }

    // فلترة حسب الحد الأقصى للتكلفة
    if (filter.maxCost !== undefined && filter.currency) {
      treatments = treatments.filter((t) => {
        if (!t.cost || t.cost.currency !== filter.currency) {
          return false;
        }
        const costPerHive = t.cost.perHive || t.cost.price;
        return costPerHive <= filter.maxCost!;
      });
    }

    // فلترة بدون وصفة طبية
    if (filter.noPrescription) {
      treatments = treatments.filter((t) => t.requiresPrescription === false);
    }

    // فلترة حسب الموسم
    if (filter.season) {
      treatments = treatments.filter(
        (t) => t.recommendedSeason && t.recommendedSeason.includes(filter.season!)
      );
    }

    // البحث النصي
    if (filter.searchText) {
      const query = filter.searchText.toLowerCase();
      treatments = treatments.filter((t) => {
        const nameAr = t.name.ar.toLowerCase();
        const nameEn = t.name.en.toLowerCase();
        const nameFr = (t.name.fr || '').toLowerCase();
        const descAr = t.description.ar.toLowerCase();
        const descEn = t.description.en.toLowerCase();
        const descFr = (t.description.fr || '').toLowerCase();
        const tradeNameAr = (t.tradeName?.ar || '').toLowerCase();
        const tradeNameEn = (t.tradeName?.en || '').toLowerCase();
        const tradeNameFr = (t.tradeName?.fr || '').toLowerCase();

        return (
          nameAr.includes(query) ||
          nameEn.includes(query) ||
          nameFr.includes(query) ||
          descAr.includes(query) ||
          descEn.includes(query) ||
          descFr.includes(query) ||
          tradeNameAr.includes(query) ||
          tradeNameEn.includes(query) ||
          tradeNameFr.includes(query)
        );
      });
    }

    return treatments;
  }

  /**
   * الحصول على علاج بواسطة المعرف
   * Get treatment by ID
   */
  static getTreatmentById(id: string): Treatment | undefined {
    return allTreatments.find((t) => t.id === id);
  }

  /**
   * البحث في العلاجات
   * Search treatments
   */
  static searchTreatments(query: string, locale: 'ar' | 'en' | 'fr' = 'ar'): Treatment[] {
    const lowerQuery = query.toLowerCase();
    return allTreatments.filter((t) => {
      const name = (t.name[locale] || t.name.en).toLowerCase();
      const description = (t.description[locale] || t.description.en).toLowerCase();
      const tradeName = (t.tradeName?.[locale] || t.tradeName?.en || '').toLowerCase();
      const activeIngredient = (t.activeIngredient?.[locale] || t.activeIngredient?.en || '').toLowerCase();

      return (
        name.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        tradeName.includes(lowerQuery) ||
        activeIngredient.includes(lowerQuery)
      );
    });
  }

  /**
   * الحصول على العلاجات حسب النوع
   * Get treatments by type
   */
  static getTreatmentsByType(type: TreatmentType): Treatment[] {
    return allTreatments.filter((t) => t.type === type);
  }

  /**
   * الحصول على العلاجات حسب طريقة التطبيق
   * Get treatments by application method
   */
  static getTreatmentsByApplicationMethod(method: ApplicationMethod): Treatment[] {
    return allTreatments.filter((t) => t.applicationMethod === method);
  }

  /**
   * الحصول على العلاجات حسب المرض المستهدف
   * Get treatments by target disease
   */
  static getTreatmentsByDisease(diseaseId: string): Treatment[] {
    return allTreatments.filter((t) => t.targetDiseases.includes(diseaseId));
  }

  /**
   * الحصول على العلاجات العضوية
   * Get organic treatments
   */
  static getOrganicTreatments(): Treatment[] {
    return allTreatments.filter((t) => t.organicCertified === true);
  }

  /**
   * الحصول على العلاجات الآمنة للعسل
   * Get honey-safe treatments
   */
  static getSafeForHoneyTreatments(): Treatment[] {
    return allTreatments.filter((t) => t.safeForHoney === true);
  }

  /**
   * الحصول على العلاجات التي لا تتطلب وصفة طبية
   * Get treatments that don't require prescription
   */
  static getNoPrescriptionTreatments(): Treatment[] {
    return allTreatments.filter((t) => t.requiresPrescription === false);
  }

  /**
   * الحصول على العلاجات حسب الموسم
   * Get treatments by season
   */
  static getTreatmentsBySeason(season: string): Treatment[] {
    return allTreatments.filter(
      (t) => t.recommendedSeason && t.recommendedSeason.includes(season)
    );
  }

  /**
   * الحصول على العلاجات الأكثر فعالية
   * Get most effective treatments
   */
  static getMostEffectiveTreatments(minEffectiveness: 4 | 5 = 4): Treatment[] {
    return allTreatments
      .filter((t) => t.effectiveness >= minEffectiveness)
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * الحصول على العلاجات الأقل تكلفة
   * Get least expensive treatments
   */
  static getLeastExpensiveTreatments(currency: string = 'USD', limit: number = 5): Treatment[] {
    return allTreatments
      .filter((t) => t.cost && t.cost.currency === currency)
      .sort((a, b) => {
        const costA = a.cost!.perHive || a.cost!.price;
        const costB = b.cost!.perHive || b.cost!.price;
        return costA - costB;
      })
      .slice(0, limit);
  }

  /**
   * الحصول على العلاجات الموصى بها لمرض معين
   * Get recommended treatments for a disease
   */
  static getRecommendedTreatmentsForDisease(
    diseaseId: string,
    options?: {
      organicOnly?: boolean;
      safeForHoneyOnly?: boolean;
      noPrescription?: boolean;
      maxCost?: number;
      currency?: string;
    }
  ): Treatment[] {
    let treatments = this.getTreatmentsByDisease(diseaseId);

    if (options?.organicOnly) {
      treatments = treatments.filter((t) => t.organicCertified === true);
    }

    if (options?.safeForHoneyOnly) {
      treatments = treatments.filter((t) => t.safeForHoney === true);
    }

    if (options?.noPrescription) {
      treatments = treatments.filter((t) => t.requiresPrescription === false);
    }

    if (options?.maxCost !== undefined && options?.currency) {
      treatments = treatments.filter((t) => {
        if (!t.cost || t.cost.currency !== options.currency) {
          return false;
        }
        const costPerHive = t.cost.perHive || t.cost.price;
        return costPerHive <= options.maxCost!;
      });
    }

    // ترتيب حسب الفعالية
    return treatments.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * الحصول على إحصائيات العلاجات
   * Get treatment statistics
   */
  static getStatistics(currency: string = 'USD'): TreatmentStatistics {
    const byType: Record<TreatmentType, number> = {
      [TreatmentType.CHEMICAL]: 0,
      [TreatmentType.ORGANIC]: 0,
      [TreatmentType.BIOLOGICAL]: 0,
      [TreatmentType.MECHANICAL]: 0,
      [TreatmentType.THERMAL]: 0,
      [TreatmentType.NUTRITIONAL]: 0,
    };

    const byApplicationMethod: Record<ApplicationMethod, number> = {
      [ApplicationMethod.SPRAY]: 0,
      [ApplicationMethod.FUMIGATION]: 0,
      [ApplicationMethod.FEEDING]: 0,
      [ApplicationMethod.STRIPS]: 0,
      [ApplicationMethod.POWDER]: 0,
      [ApplicationMethod.LIQUID]: 0,
      [ApplicationMethod.PILLS]: 0,
      [ApplicationMethod.TOPICAL]: 0,
      [ApplicationMethod.MECHANICAL]: 0,
      [ApplicationMethod.THERMAL]: 0,
    };

    let totalEffectiveness = 0;
    let totalCost = 0;
    let costCount = 0;
    let organicCount = 0;
    let safeForHoneyCount = 0;

    allTreatments.forEach((t) => {
      byType[t.type]++;
      byApplicationMethod[t.applicationMethod]++;
      totalEffectiveness += t.effectiveness;

      if (t.cost && t.cost.currency === currency) {
        totalCost += t.cost.perHive || t.cost.price;
        costCount++;
      }

      if (t.organicCertified) {
        organicCount++;
      }

      if (t.safeForHoney) {
        safeForHoneyCount++;
      }
    });

    return {
      total: allTreatments.length,
      byType,
      byApplicationMethod,
      averageEffectiveness: totalEffectiveness / allTreatments.length,
      averageCost: costCount > 0 ? totalCost / costCount : undefined,
      currency: costCount > 0 ? currency : undefined,
      organicCount,
      safeForHoneyCount,
    };
  }

  /**
   * مقارنة علاجين
   * Compare two treatments
   */
  static compareTreatments(
    treatmentId1: string,
    treatmentId2: string
  ): {
    treatment1: Treatment | undefined;
    treatment2: Treatment | undefined;
    comparison: {
      effectiveness: 'equal' | 'treatment1' | 'treatment2';
      cost: 'equal' | 'treatment1' | 'treatment2' | 'unknown';
      organic: 'both' | 'treatment1' | 'treatment2' | 'neither';
      safeForHoney: 'both' | 'treatment1' | 'treatment2' | 'neither';
      prescription: 'both' | 'treatment1' | 'treatment2' | 'neither';
    };
  } {
    const t1 = this.getTreatmentById(treatmentId1);
    const t2 = this.getTreatmentById(treatmentId2);

    if (!t1 || !t2) {
      return {
        treatment1: t1,
        treatment2: t2,
        comparison: {
          effectiveness: 'equal',
          cost: 'unknown',
          organic: 'neither',
          safeForHoney: 'neither',
          prescription: 'neither',
        },
      };
    }

    const comparison = {
      effectiveness:
        t1.effectiveness === t2.effectiveness
          ? ('equal' as const)
          : t1.effectiveness > t2.effectiveness
            ? ('treatment1' as const)
            : ('treatment2' as const),
      cost: (() => {
        if (!t1.cost || !t2.cost || t1.cost.currency !== t2.cost.currency) {
          return 'unknown' as const;
        }
        const cost1 = t1.cost.perHive || t1.cost.price;
        const cost2 = t2.cost.perHive || t2.cost.price;
        return cost1 === cost2
          ? ('equal' as const)
          : cost1 < cost2
            ? ('treatment1' as const)
            : ('treatment2' as const);
      })(),
      organic:
        t1.organicCertified && t2.organicCertified
          ? ('both' as const)
          : t1.organicCertified
            ? ('treatment1' as const)
            : t2.organicCertified
              ? ('treatment2' as const)
              : ('neither' as const),
      safeForHoney:
        t1.safeForHoney && t2.safeForHoney
          ? ('both' as const)
          : t1.safeForHoney
            ? ('treatment1' as const)
            : t2.safeForHoney
              ? ('treatment2' as const)
              : ('neither' as const),
      prescription:
        t1.requiresPrescription && t2.requiresPrescription
          ? ('both' as const)
          : t1.requiresPrescription
            ? ('treatment1' as const)
            : t2.requiresPrescription
              ? ('treatment2' as const)
              : ('neither' as const),
    };

    return {
      treatment1: t1,
      treatment2: t2,
      comparison,
    };
  }
}
