/**
 * Disease Manager Context
 * React Context لإدارة حالة المكتبة
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DatabaseAdapter } from '../database/types';
import { PlatformAdapter } from '../platform/types';
import { DiseaseService } from '../services/DiseaseService';
import { TreatmentService } from '../services/TreatmentService';
import { DiagnosisService } from '../services/DiagnosisService';

/**
 * تكوين Disease Manager
 */
export interface DiseaseManagerConfig {
  /** محول قاعدة البيانات */
  database: DatabaseAdapter;
  
  /** محول المنصة */
  platform: PlatformAdapter;
  
  /** معرف المستخدم (اختياري) */
  userId?: string;
  
  /** تفعيل وضع الأوفلاين */
  offlineMode?: boolean;
}

/**
 * حالة Disease Manager
 */
export interface DiseaseManagerState {
  /** هل تم التهيئة */
  initialized: boolean;
  
  /** هل في وضع الأوفلاين */
  isOffline: boolean;
  
  /** معرف المستخدم */
  userId?: string;
  
  /** رسالة خطأ */
  error?: string;
}

/**
 * قيمة Context
 */
export interface DiseaseManagerContextValue {
  /** التكوين */
  config: DiseaseManagerConfig | null;
  
  /** الحالة */
  state: DiseaseManagerState;
  
  /** خدمة الأمراض */
  diseaseService: typeof DiseaseService;
  
  /** خدمة العلاجات */
  treatmentService: typeof TreatmentService;
  
  /** خدمة التشخيص */
  diagnosisService: DiagnosisService | null;
  
  /** تهيئة المكتبة */
  initialize: (config: DiseaseManagerConfig) => Promise<void>;
  
  /** تبديل وضع الأوفلاين */
  toggleOfflineMode: () => void;
  
  /** تحديث معرف المستخدم */
  setUserId: (userId: string) => void;
  
  /** مسح الخطأ */
  clearError: () => void;
}

/**
 * Context الافتراضي
 */
const DiseaseManagerContext = createContext<DiseaseManagerContextValue | undefined>(undefined);

/**
 * Props للـ Provider
 */
export interface DiseaseManagerProviderProps {
  /** المكونات الفرعية */
  children: ReactNode;
  
  /** التكوين الأولي (اختياري) */
  config?: DiseaseManagerConfig;
}

/**
 * Disease Manager Provider
 * مزود Context للمكتبة
 */
export const DiseaseManagerProvider: React.FC<DiseaseManagerProviderProps> = ({
  children,
  config: initialConfig,
}) => {
  // الحالة
  const [config, setConfig] = useState<DiseaseManagerConfig | null>(initialConfig || null);
  const [state, setState] = useState<DiseaseManagerState>({
    initialized: false,
    isOffline: initialConfig?.offlineMode || false,
    userId: initialConfig?.userId,
  });
  const [diagnosisService, setDiagnosisService] = useState<DiagnosisService | null>(null);

  /**
   * تهيئة المكتبة
   */
  const initialize = useCallback(async (newConfig: DiseaseManagerConfig) => {
    try {
      // حفظ التكوين
      setConfig(newConfig);
      
      // إنشاء خدمة التشخيص
      const diagnosis = new DiagnosisService(newConfig.database);
      setDiagnosisService(diagnosis);
      
      // تحديث الحالة
      setState({
        initialized: true,
        isOffline: newConfig.offlineMode || false,
        userId: newConfig.userId,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'فشل التهيئة',
      }));
      throw error;
    }
  }, []);

  /**
   * تبديل وضع الأوفلاين
   */
  const toggleOfflineMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOffline: !prev.isOffline,
    }));
  }, []);

  /**
   * تحديث معرف المستخدم
   */
  const setUserId = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      userId,
    }));
  }, []);

  /**
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: undefined,
    }));
  }, []);

  // القيمة
  const value: DiseaseManagerContextValue = {
    config,
    state,
    diseaseService: DiseaseService,
    treatmentService: TreatmentService,
    diagnosisService,
    initialize,
    toggleOfflineMode,
    setUserId,
    clearError,
  };

  return (
    <DiseaseManagerContext.Provider value={value}>
      {children}
    </DiseaseManagerContext.Provider>
  );
};

/**
 * Hook للوصول إلى Disease Manager Context
 */
export const useDiseaseManagerContext = (): DiseaseManagerContextValue => {
  const context = useContext(DiseaseManagerContext);
  
  if (context === undefined) {
    throw new Error('useDiseaseManagerContext must be used within a DiseaseManagerProvider');
  }
  
  return context;
};
