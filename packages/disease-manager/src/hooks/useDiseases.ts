/**
 * useDiseases Hook
 * Hook للعمل مع الأمراض
 */

import { useState, useEffect, useMemo } from 'react';
import { useDiseaseManager } from './useDiseaseManager';
import { Disease, DiseaseCategory } from '../types/disease';
import { Locale } from '../i18n/types';
import { useI18n } from '../i18n/I18nContext';

/**
 * خيارات الفلترة
 */
export interface UseDiseasesOptions {
  /** الفئة */
  category?: DiseaseCategory;
  
  /** الحد الأدنى لمستوى الخطورة */
  minSeverity?: number;
  
  /** نص البحث */
  searchQuery?: string;
  
  /** اللغة (افتراضياً من I18n) */
  locale?: Locale;
}

/**
 * Hook للعمل مع الأمراض
 * 
 * @example
 * ```tsx
 * const { diseases, loading, search, filterByCategory } = useDiseases({
 *   category: 'brood',
 *   minSeverity: 3
 * });
 * ```
 */
export const useDiseases = (options: UseDiseasesOptions = {}) => {
  const { diseaseService } = useDiseaseManager();
  const { locale: i18nLocale } = useI18n();
  const locale = options.locale || i18nLocale;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // الحصول على جميع الأمراض
  const allDiseases = useMemo(() => {
    try {
      return diseaseService.getDiseases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الأمراض');
      return [];
    }
  }, [diseaseService]);

  // تطبيق الفلاتر
  const diseases = useMemo(() => {
    let filtered = [...allDiseases];

    // فلترة حسب الفئة
    if (options.category) {
      filtered = diseaseService.getDiseasesByCategory(options.category);
    }

    // فلترة حسب مستوى الخطورة
    if (options.minSeverity !== undefined) {
      filtered = diseaseService.getDiseasesBySeverity(options.minSeverity);
    }

    // البحث
    if (options.searchQuery) {
      filtered = diseaseService.searchDiseases(options.searchQuery, locale);
    }

    return filtered;
  }, [allDiseases, options.category, options.minSeverity, options.searchQuery, locale, diseaseService]);

  /**
   * البحث عن أمراض
   */
  const search = (query: string): Disease[] => {
    return diseaseService.searchDiseases(query, locale);
  };

  /**
   * الحصول على مرض بالمعرف
   */
  const getDiseaseById = (id: string): Disease | undefined => {
    return diseaseService.getDiseaseById(id);
  };

  /**
   * فلترة حسب الفئة
   */
  const filterByCategory = (category: DiseaseCategory): Disease[] => {
    return diseaseService.getDiseasesByCategory(category);
  };

  /**
   * فلترة حسب مستوى الخطورة
   */
  const filterBySeverity = (minSeverity: number): Disease[] => {
    return diseaseService.getDiseasesBySeverity(minSeverity);
  };

  /**
   * الحصول على الأمراض الأكثر انتشاراً
   */
  const getMostPrevalent = (limit?: number): Disease[] => {
    return diseaseService.getMostPrevalentDiseases(limit);
  };

  /**
   * الحصول على الأمراض الأكثر خطورة
   */
  const getMostDangerous = (limit?: number): Disease[] => {
    return diseaseService.getMostDangerousDiseases(limit);
  };

  return {
    /** قائمة الأمراض المفلترة */
    diseases,
    
    /** جميع الأمراض */
    allDiseases,
    
    /** حالة التحميل */
    loading,
    
    /** رسالة الخطأ */
    error,
    
    /** البحث عن أمراض */
    search,
    
    /** الحصول على مرض بالمعرف */
    getDiseaseById,
    
    /** فلترة حسب الفئة */
    filterByCategory,
    
    /** فلترة حسب مستوى الخطورة */
    filterBySeverity,
    
    /** الحصول على الأمراض الأكثر انتشاراً */
    getMostPrevalent,
    
    /** الحصول على الأمراض الأكثر خطورة */
    getMostDangerous,
  };
};
