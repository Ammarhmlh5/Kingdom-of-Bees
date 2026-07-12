/**
 * useDiagnosis Hook
 * Hook للعمل مع التشخيص
 */

import { useState, useCallback } from 'react';
import { useDiseaseManager } from './useDiseaseManager';
import {
  DiagnosisSession,
  DiagnosisResult,
  SymptomInput,
  ImageInput,
  DiseaseCategory,
} from '../types/diagnosis';

/**
 * Hook للعمل مع التشخيص
 * 
 * @example
 * ```tsx
 * const { session, startSession, addSymptom, analyze } = useDiagnosis();
 * 
 * // بدء جلسة تشخيص
 * await startSession({ hiveId: 'hive-1' });
 * 
 * // إضافة أعراض
 * addSymptom({ symptomId: 'symptom-1', severity: 4 });
 * 
 * // تحليل
 * const result = await analyze();
 * ```
 */
export const useDiagnosis = () => {
  const { diagnosisService, state } = useDiseaseManager();
  
  const [session, setSession] = useState<DiagnosisSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * بدء جلسة تشخيص جديدة
   */
  const startSession = useCallback(async (params: {
    hiveId: string;
    category?: DiseaseCategory;
    userId?: string;
  }) => {
    if (!diagnosisService) {
      setError('خدمة التشخيص غير متاحة. يرجى تهيئة المكتبة أولاً.');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newSession = await diagnosisService.startSession({
        ...params,
        userId: params.userId || state.userId,
      });
      
      setSession(newSession);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل بدء جلسة التشخيص';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [diagnosisService, state.userId]);

  /**
   * إضافة عرض
   */
  const addSymptom = useCallback((symptom: SymptomInput) => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return;
    }

    try {
      const updatedSession = diagnosisService.addSymptom(session.id, symptom);
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة العرض');
    }
  }, [session, diagnosisService]);

  /**
   * إزالة عرض
   */
  const removeSymptom = useCallback((symptomId: string) => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return;
    }

    try {
      const updatedSession = diagnosisService.removeSymptom(session.id, symptomId);
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إزالة العرض');
    }
  }, [session, diagnosisService]);

  /**
   * تحديث عرض
   */
  const updateSymptom = useCallback((symptomId: string, severity: number) => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return;
    }

    try {
      const updatedSession = diagnosisService.updateSymptom(session.id, symptomId, severity);
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحديث العرض');
    }
  }, [session, diagnosisService]);

  /**
   * إضافة صورة
   */
  const addImage = useCallback((image: ImageInput) => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return;
    }

    try {
      const updatedSession = diagnosisService.addImage(session.id, image);
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة الصورة');
    }
  }, [session, diagnosisService]);

  /**
   * إزالة صورة
   */
  const removeImage = useCallback((imageId: string) => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return;
    }

    try {
      const updatedSession = diagnosisService.removeImage(session.id, imageId);
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إزالة الصورة');
    }
  }, [session, diagnosisService]);

  /**
   * تحليل الأعراض والحصول على النتائج
   */
  const analyze = useCallback(async (): Promise<DiagnosisResult | null> => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await diagnosisService.analyze(session.id);
      
      // تحديث الجلسة بالنتائج
      const updatedSession = diagnosisService.getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل التحليل';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, diagnosisService]);

  /**
   * حفظ النتائج
   */
  const saveResults = useCallback(async (): Promise<boolean> => {
    if (!session || !diagnosisService) {
      setError('لا توجد جلسة تشخيص نشطة');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await diagnosisService.saveResults(session.id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل حفظ النتائج';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, diagnosisService]);

  /**
   * إنهاء الجلسة
   */
  const endSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  /**
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    /** الجلسة الحالية */
    session,
    
    /** حالة التحميل */
    loading,
    
    /** رسالة الخطأ */
    error,
    
    /** بدء جلسة تشخيص جديدة */
    startSession,
    
    /** إضافة عرض */
    addSymptom,
    
    /** إزالة عرض */
    removeSymptom,
    
    /** تحديث عرض */
    updateSymptom,
    
    /** إضافة صورة */
    addImage,
    
    /** إزالة صورة */
    removeImage,
    
    /** تحليل الأعراض */
    analyze,
    
    /** حفظ النتائج */
    saveResults,
    
    /** إنهاء الجلسة */
    endSession,
    
    /** مسح الخطأ */
    clearError,
    
    /** هل الجلسة نشطة */
    isActive: session !== null,
    
    /** عدد الأعراض */
    symptomCount: session?.symptoms.length || 0,
    
    /** عدد الصور */
    imageCount: session?.images.length || 0,
    
    /** هل يمكن التحليل */
    canAnalyze: session !== null && session.symptoms.length > 0,
  };
};
