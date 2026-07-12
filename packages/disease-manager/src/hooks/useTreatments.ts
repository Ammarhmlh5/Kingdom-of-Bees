/**
 * useTreatments Hook
 * Hook للعمل مع العلاجات
 */

import { useState, useMemo } from 'react';
import { useDiseaseManager } from './useDiseaseManager';
import { Treatment, TreatmentType, ApplicationMethod } from '../types/treatment';
import { Locale } from '../i18n/types';
import { useI18n } from '../i18n/I18nContext';

/**
 * خيارات الفلترة
 */
export interface UseTreatmentsOptions {
  /** نوع العلاج */
  type?: TreatmentType;
  
  /** طريقة التطبيق */
  applicationMethod?: ApplicationMethod;
  
  /** معرف المرض */
  diseaseId?: string;
  
  /** نص البحث */
  searchQuery?: string;
  
  /** اللغة (افتراضياً من I18n) */
  locale?: Locale;
}

/**
 * Hook للعمل مع العلاجات
 * 
 * @example
 * ```tsx
 * const { treatments, search, filterByType } = useTreatments({
 *   type: 'organic',
 *   diseaseId: 'american-foulbrood'
 * });
 * ```
 */
export const useTreatments = (options: UseTreatmentsOptions = {}) => {
  const { treatmentService } = useDiseaseManager();
  const { locale: i18nLocale } = useI18n();
  const locale = options.locale || i18nLocale;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // الحصول على جميع العلاجات
  const allTreatments = useMemo(() => {
    try {
      return treatmentService.getTreatments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل العلاجات');
      return [];
    }
  }, [treatmentService]);

  // تطبيق الفلاتر
  const treatments = useMemo(() => {
    let filtered = [...allTreatments];

    // فلترة حسب النوع
    if (options.type) {
      filtered = treatmentService.getTreatmentsByType(options.type);
    }

    // فلترة حسب طريقة التطبيق
    if (options.applicationMethod) {
      filtered = treatmentService.getTreatmentsByApplicationMethod(options.applicationMethod);
    }

    // فلترة حسب المرض
    if (options.diseaseId) {
      filtered = treatmentService.getTreatmentsForDisease(options.diseaseId);
    }

    // البحث
    if (options.searchQuery) {
      filtered = treatmentService.searchTreatments(options.searchQuery, locale);
    }

    return filtered;
  }, [allTreatments, options.type, options.applicationMethod, options.diseaseId, options.searchQuery, locale, treatmentService]);

  /**
   * البحث عن علاجات
   */
  const search = (query: string): Treatment[] => {
    return treatmentService.searchTreatments(query, locale);
  };

  /**
   * الحصول على علاج بالمعرف
   */
  const getTreatmentById = (id: string): Treatment | undefined => {
    return treatmentService.getTreatmentById(id);
  };

  /**
   * فلترة حسب النوع
   */
  const filterByType = (type: TreatmentType): Treatment[] => {
    return treatmentService.getTreatmentsByType(type);
  };

  /**
   * فلترة حسب طريقة التطبيق
   */
  const filterByApplicationMethod = (method: ApplicationMethod): Treatment[] => {
    return treatmentService.getTreatmentsByApplicationMethod(method);
  };

  /**
   * الحصول على علاجات لمرض معين
   */
  const getForDisease = (diseaseId: string): Treatment[] => {
    return treatmentService.getTreatmentsForDisease(diseaseId);
  };

  /**
   * الحصول على العلاجات الكيميائية
   */
  const getChemical = (): Treatment[] => {
    return treatmentService.getChemicalTreatments();
  };

  /**
   * الحصول على العلاجات العضوية
   */
  const getOrganic = (): Treatment[] => {
    return treatmentService.getOrganicTreatments();
  };

  /**
   * الحصول على العلاجات البيولوجية
   */
  const getBiological = (): Treatment[] => {
    return treatmentService.getBiologicalTreatments();
  };

  /**
   * الحصول على العلاجات الميكانيكية
   */
  const getMechanical = (): Treatment[] => {
    return treatmentService.getMechanicalTreatments();
  };

  /**
   * الحصول على العلاجات الآمنة للعسل
   */
  const getHoneySafe = (): Treatment[] => {
    return treatmentService.getHoneySafeTreatments();
  };

  /**
   * مقارنة علاجات
   */
  const compare = (treatmentIds: string[]): Treatment[] => {
    return treatmentService.compareTreatments(treatmentIds);
  };

  return {
    /** قائمة العلاجات المفلترة */
    treatments,
    
    /** جميع العلاجات */
    allTreatments,
    
    /** حالة التحميل */
    loading,
    
    /** رسالة الخطأ */
    error,
    
    /** البحث عن علاجات */
    search,
    
    /** الحصول على علاج بالمعرف */
    getTreatmentById,
    
    /** فلترة حسب النوع */
    filterByType,
    
    /** فلترة حسب طريقة التطبيق */
    filterByApplicationMethod,
    
    /** الحصول على علاجات لمرض معين */
    getForDisease,
    
    /** الحصول على العلاجات الكيميائية */
    getChemical,
    
    /** الحصول على العلاجات العضوية */
    getOrganic,
    
    /** الحصول على العلاجات البيولوجية */
    getBiological,
    
    /** الحصول على العلاجات الميكانيكية */
    getMechanical,
    
    /** الحصول على العلاجات الآمنة للعسل */
    getHoneySafe,
    
    /** مقارنة علاجات */
    compare,
  };
};
