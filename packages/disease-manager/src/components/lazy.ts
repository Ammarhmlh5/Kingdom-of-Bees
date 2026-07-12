/**
 * Lazy Loaded Components
 * 
 * هذا الملف يصدر جميع المكونات بشكل كسول (Lazy Loading)
 * لتحسين الأداء وتقليل حجم الحزمة الأولية.
 */

import { lazyLoadComponent } from '../utils/lazyLoad';

/**
 * Disease Components - Lazy Loaded
 */
export const DiseaseListLazy = lazyLoadComponent(
  () => import('./DiseaseList'),
  { retries: 3, retryDelay: 1000 }
);

export const DiseaseDetailLazy = lazyLoadComponent(
  () => import('./DiseaseDetail'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * Treatment Components - Lazy Loaded
 */
export const TreatmentListLazy = lazyLoadComponent(
  () => import('./TreatmentList'),
  { retries: 3, retryDelay: 1000 }
);

export const TreatmentSchedulerLazy = lazyLoadComponent(
  () => import('./TreatmentScheduler'),
  { retries: 3, retryDelay: 1000 }
);

export const ScheduleTimelineLazy = lazyLoadComponent(
  () => import('./ScheduleTimeline'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * Diagnosis Components - Lazy Loaded
 */
export const DiagnosisWizardLazy = lazyLoadComponent(
  () => import('./DiagnosisWizard'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * Alert Components - Lazy Loaded
 */
export const AlertListLazy = lazyLoadComponent(
  () => import('./AlertList'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * Hive Record Components - Lazy Loaded
 */
export const HiveRecordTimelineLazy = lazyLoadComponent(
  () => import('./HiveRecordTimeline'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * Sync Components - Lazy Loaded
 */
export const SyncStatusLazy = lazyLoadComponent(
  () => import('./SyncStatus'),
  { retries: 3, retryDelay: 1000 }
);

/**
 * تصدير جميع المكونات الكسولة
 */
export const LazyComponents = {
  DiseaseList: DiseaseListLazy,
  DiseaseDetail: DiseaseDetailLazy,
  TreatmentList: TreatmentListLazy,
  TreatmentScheduler: TreatmentSchedulerLazy,
  ScheduleTimeline: ScheduleTimelineLazy,
  DiagnosisWizard: DiagnosisWizardLazy,
  AlertList: AlertListLazy,
  HiveRecordTimeline: HiveRecordTimelineLazy,
  SyncStatus: SyncStatusLazy,
};
