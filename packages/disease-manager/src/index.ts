/**
 * @kingdom-of-bees/disease-manager
 * مكتبة React شاملة متعددة المنصات لإدارة أمراض النحل
 */

// Platform Abstraction Layer
export * from './platform';

// Database Abstraction Layer
export * from './database';

// I18n System
export * from './i18n';

// Disease Types and Data
export * from './types/disease';
export * from './data/diseases';

// Treatment Types and Data
export * from './types/treatment';
export * from './data/treatments';

// Services
export * from './services/DiseaseService';
export * from './services/TreatmentService';
export * from './services/DiagnosisService';
export * from './services/TreatmentSchedulerService';
export * from './services/AlertService';
export * from './services/SyncService';

// Diagnosis Types
export * from './types/diagnosis';

// Schedule Types
export * from './types/schedule';

// Alert Types
export * from './types/alert';

// Sync Types
export * from './types/sync';

// Diagnosis Core
export * from './core/DiagnosisSessionManager';
export * from './core/SymptomMatcher';
export * from './core/DiagnosisEngine';

// Treatment Scheduler Core
export * from './core/TreatmentScheduleManager';
export * from './core/SafetyPeriodCalculator';
export * from './core/CostTracker';

// Alert Core
export * from './core/AlertManager';

// Sync Core
export * from './core/OfflineQueue';
export * from './core/SyncManager';

// Hive Record Types
export * from './types/hive-record';

// Hive Record Service
export * from './services/HiveRecordService';

// Disease Manager Core
export * from './core/DiseaseManager';

// React Components
export * from './components';

// Lazy Loaded Components
export * from './components/lazy';

// React Context
export * from './context';

// React Hooks
export * from './hooks';

// Lazy Loading Utilities
export * from './utils/lazyLoad';

// Version
export const version = '0.1.0';
