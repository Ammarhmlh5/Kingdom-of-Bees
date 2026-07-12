/**
 * useDiseaseManager Hook
 * Hook رئيسي للوصول إلى جميع وظائف المكتبة
 */

import { useDiseaseManagerContext } from '../context/DiseaseManagerContext';

/**
 * Hook للوصول إلى Disease Manager
 * 
 * @example
 * ```tsx
 * const { diseaseService, diagnosisService, state } = useDiseaseManager();
 * 
 * // استخدام خدمة الأمراض
 * const diseases = diseaseService.getDiseases();
 * 
 * // بدء تشخيص
 * const session = await diagnosisService.startSession({ hiveId: 'hive-1' });
 * ```
 */
export const useDiseaseManager = () => {
  const context = useDiseaseManagerContext();
  
  return {
    /** التكوين الحالي */
    config: context.config,
    
    /** الحالة الحالية */
    state: context.state,
    
    /** خدمة الأمراض */
    diseaseService: context.diseaseService,
    
    /** خدمة العلاجات */
    treatmentService: context.treatmentService,
    
    /** خدمة التشخيص */
    diagnosisService: context.diagnosisService,
    
    /** تهيئة المكتبة */
    initialize: context.initialize,
    
    /** تبديل وضع الأوفلاين */
    toggleOfflineMode: context.toggleOfflineMode,
    
    /** تحديث معرف المستخدم */
    setUserId: context.setUserId,
    
    /** مسح الخطأ */
    clearError: context.clearError,
    
    /** هل تم التهيئة */
    isInitialized: context.state.initialized,
    
    /** هل في وضع الأوفلاين */
    isOffline: context.state.isOffline,
    
    /** رسالة الخطأ */
    error: context.state.error,
  };
};
