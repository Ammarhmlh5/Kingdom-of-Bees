/**
 * Hook لإدارة حالة تقييم الإطار
 * 
 * يوفر واجهة شاملة لإدارة بيانات الإطار، التحقق، والحفظ
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { FrameData, BroodAge, ValidationState } from '../types';
import { ValidationEngine } from '../utils/ValidationEngine';
import { getDefaultValidationRules } from '../utils/validation';

export interface UseFrameEvaluatorOptions {
  /** البيانات الأولية */
  initialData?: Partial<FrameData>;
  /** دالة الحفظ */
  onSave?: (data: FrameData) => Promise<void>;
  /** دالة عند التغيير */
  onChange?: (data: FrameData) => void;
  /** دالة عند خطأ التحقق */
  onValidationError?: (state: ValidationState) => void;
  /** تفعيل الحفظ التلقائي */
  autoSave?: boolean;
  /** فترة الحفظ التلقائي بالميلي ثانية */
  autoSaveInterval?: number;
  /** محرك التحقق المخصص */
  validationEngine?: ValidationEngine;
}

export interface UseFrameEvaluatorReturn {
  /** البيانات الحالية */
  data: FrameData;
  /** حالة التحقق */
  validationState: ValidationState;
  /** هل البيانات تم تعديلها */
  isDirty: boolean;
  /** هل يتم الحفظ حالياً */
  isSaving: boolean;
  /** تحديث نسبة العسل */
  updateHoney: (percentage: number) => void;
  /** تحديث نسبة الحضنة */
  updateBrood: (percentage: number) => void;
  /** تحديث نسبة خبز النحل */
  updateBeeBread: (percentage: number) => void;
  /** تحديث عمر الحضنة */
  updateBroodAge: (age: BroodAge) => void;
  /** تحديث جانب الإطار */
  updateSide: (side: 'A' | 'B') => void;
  /** التراجع عن آخر تغيير */
  undo: () => void;
  /** إعادة آخر تغيير تم التراجع عنه */
  redo: () => void;
  /** هل يمكن التراجع */
  canUndo: boolean;
  /** هل يمكن الإعادة */
  canRedo: boolean;
  /** حفظ البيانات */
  save: () => Promise<void>;
  /** إعادة تعيين البيانات */
  reset: () => void;
}

const DEFAULT_DATA: FrameData = {
  side: 'A',
  honeyPercentage: 0,
  broodPercentage: 0,
  beeBreadPercentage: 0,
  emptyPercentage: 100,
  broodAge: 'MIXED',
  isValid: true,
};

/**
 * Hook لإدارة حالة تقييم الإطار
 */
export function useFrameEvaluator(options: UseFrameEvaluatorOptions = {}): UseFrameEvaluatorReturn {
  const {
    initialData,
    onSave,
    onChange,
    onValidationError,
    autoSave = false,
    autoSaveInterval = 5000,
    validationEngine: customValidationEngine,
  } = options;

  // إنشاء محرك التحقق
  const validationEngine = useRef(customValidationEngine || new ValidationEngine(getDefaultValidationRules())).current;

  // البيانات الأولية
  const initialFrameData: FrameData = {
    ...DEFAULT_DATA,
    ...initialData,
  };

  // حساب النسبة الفارغة
  if (initialData) {
    initialFrameData.emptyPercentage = 100 - (
      (initialData.honeyPercentage || 0) +
      (initialData.broodPercentage || 0) +
      (initialData.beeBreadPercentage || 0)
    );
  }

  // الحالة
  const [data, setData] = useState<FrameData>(initialFrameData);
  const [validationState, setValidationState] = useState<ValidationState>(
    validationEngine.validate(initialFrameData)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // تاريخ التغييرات (للـ Undo/Redo)
  const [history, setHistory] = useState<FrameData[]>([initialFrameData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // مرجع للبيانات الأصلية
  const originalData = useRef(initialFrameData);

  // مرجع لمؤقت الحفظ التلقائي
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * تحديث البيانات وإضافتها للتاريخ
   */
  const updateData = useCallback((newData: FrameData) => {
    // حساب النسبة الفارغة
    const emptyPercentage = 100 - (
      newData.honeyPercentage +
      newData.broodPercentage +
      newData.beeBreadPercentage
    );

    const updatedData: FrameData = {
      ...newData,
      emptyPercentage: Math.max(0, emptyPercentage),
    };

    // التحقق من البيانات
    const validation = validationEngine.validate(updatedData);
    updatedData.isValid = validation.isValid;

    // تحديث الحالة
    setData(updatedData);
    setValidationState(validation);
    setIsDirty(true);

    // إضافة للتاريخ
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(updatedData);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);

    // استدعاء onChange
    if (onChange) {
      onChange(updatedData);
    }

    // استدعاء onValidationError إذا كانت هناك أخطاء
    if (!validation.isValid && onValidationError) {
      onValidationError(validation);
    }
  }, [historyIndex, onChange, onValidationError, validationEngine]);

  /**
   * تحديث نسبة العسل
   */
  const updateHoney = useCallback((percentage: number) => {
    updateData({
      ...data,
      honeyPercentage: Math.max(0, Math.min(100, percentage)),
    });
  }, [data, updateData]);

  /**
   * تحديث نسبة الحضنة
   */
  const updateBrood = useCallback((percentage: number) => {
    updateData({
      ...data,
      broodPercentage: Math.max(0, Math.min(100, percentage)),
    });
  }, [data, updateData]);

  /**
   * تحديث نسبة خبز النحل
   */
  const updateBeeBread = useCallback((percentage: number) => {
    updateData({
      ...data,
      beeBreadPercentage: Math.max(0, Math.min(100, percentage)),
    });
  }, [data, updateData]);

  /**
   * تحديث عمر الحضنة
   */
  const updateBroodAge = useCallback((age: BroodAge) => {
    updateData({
      ...data,
      broodAge: age,
    });
  }, [data, updateData]);

  /**
   * تحديث جانب الإطار
   */
  const updateSide = useCallback((side: 'A' | 'B') => {
    updateData({
      ...data,
      side,
    });
  }, [data, updateData]);

  /**
   * التراجع عن آخر تغيير
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousData = history[newIndex];
      
      setData(previousData);
      setHistoryIndex(newIndex);
      setValidationState(validationEngine.validate(previousData));
      setIsDirty(newIndex > 0);

      if (onChange) {
        onChange(previousData);
      }
    }
  }, [historyIndex, history, onChange, validationEngine]);

  /**
   * إعادة آخر تغيير تم التراجع عنه
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextData = history[newIndex];
      
      setData(nextData);
      setHistoryIndex(newIndex);
      setValidationState(validationEngine.validate(nextData));
      setIsDirty(true);

      if (onChange) {
        onChange(nextData);
      }
    }
  }, [historyIndex, history, onChange, validationEngine]);

  /**
   * حفظ البيانات
   */
  const save = useCallback(async () => {
    if (!onSave || !data.isValid) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(data);
      setIsDirty(false);
      originalData.current = data;
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  /**
   * إعادة تعيين البيانات
   */
  const reset = useCallback(() => {
    setData(originalData.current);
    setValidationState(validationEngine.validate(originalData.current));
    setIsDirty(false);
    setHistory([originalData.current]);
    setHistoryIndex(0);

    if (onChange) {
      onChange(originalData.current);
    }
  }, [onChange, validationEngine]);

  // الحفظ التلقائي
  useEffect(() => {
    if (!autoSave || !onSave || !isDirty || !data.isValid) {
      return;
    }

    // إلغاء المؤقت السابق
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // إنشاء مؤقت جديد
    autoSaveTimer.current = setTimeout(() => {
      save();
    }, autoSaveInterval);

    // تنظيف
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, onSave, isDirty, data, autoSaveInterval, save]);

  return {
    data,
    validationState,
    isDirty,
    isSaving,
    updateHoney,
    updateBrood,
    updateBeeBread,
    updateBroodAge,
    updateSide,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    save,
    reset,
  };
}
