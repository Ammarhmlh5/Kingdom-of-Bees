
import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { InspectionSettingController } from '../controllers/inspectionSetting.controller';
import { InspectionScheduleController } from '../controllers/inspectionSchedule.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { upsertInspectionSettingSchema, updateInspectionSettingSchema, createInspectionScheduleSchema, validateInspectionDateSchema } from '../validators/inspection.schema';

const router = Router();
const inspectionController = new InspectionController();
const settingController = new InspectionSettingController();
const scheduleController = new InspectionScheduleController();

// ============================================================================
// 1. إعدادات الفحص (Inspection Settings) - مسارات عامة
// ============================================================================
const settingsRouter = Router();
settingsRouter.use(requireAuth);
settingsRouter.get('/', settingController.getAll.bind(settingController));
settingsRouter.get('/:type', settingController.getByType.bind(settingController));
settingsRouter.post('/', validate(upsertInspectionSettingSchema), settingController.upsert.bind(settingController));
settingsRouter.put('/:type', validate(updateInspectionSettingSchema), settingController.update.bind(settingController));
settingsRouter.delete('/:type', settingController.deactivate.bind(settingController));

// ============================================================================
// 2. جدولة الفحوصات (Inspection Schedules) - مسارات عامة
// ============================================================================
const schedulesRouter = Router();
schedulesRouter.use(requireAuth);
schedulesRouter.get('/upcoming', scheduleController.getUpcoming.bind(scheduleController));
schedulesRouter.get('/overdue', scheduleController.getOverdue.bind(scheduleController));
schedulesRouter.post('/', validate(createInspectionScheduleSchema), scheduleController.create.bind(scheduleController));
schedulesRouter.put('/:id/complete', scheduleController.complete.bind(scheduleController));
schedulesRouter.put('/:id/cancel', scheduleController.cancel.bind(scheduleController));
schedulesRouter.delete('/:id', scheduleController.delete.bind(scheduleController));

// ============================================================================
// 3. الفحوصات (Apiary-scoped)
// ============================================================================
const apiaryInspectionRouter = Router({ mergeParams: true });
apiaryInspectionRouter.use(requireAuth);
apiaryInspectionRouter.get('/', inspectionController.getInspections.bind(inspectionController));
apiaryInspectionRouter.get('/queue', inspectionController.getInspectionQueue.bind(inspectionController));
apiaryInspectionRouter.post('/validate', validate(validateInspectionDateSchema), settingController.validate.bind(settingController));

// مسارات خاصة بالخلية
apiaryInspectionRouter.get('/:hiveId/schedules', scheduleController.getByHiveId.bind(scheduleController));
apiaryInspectionRouter.get('/schedules', scheduleController.getByApiaryId.bind(scheduleController));
apiaryInspectionRouter.post('/validate-date', validate(validateInspectionDateSchema), settingController.validate.bind(settingController));

// Export routers for use in main routes
export { settingsRouter, schedulesRouter, apiaryInspectionRouter };

// ============================================================================
// 4. مسارات جداول المنحل (Apiary-scoped Schedules)
// ============================================================================
const apiarySchedulesRouter = Router({ mergeParams: true });
apiarySchedulesRouter.use(requireAuth);
apiarySchedulesRouter.get('/:apiaryId/schedules', scheduleController.getByApiaryId.bind(scheduleController));

// Drafts (Voice AI) - Methods missing
// router.get('/drafts', controller.getDrafts);
// router.post('/drafts', controller.saveDraft);
// router.post('/drafts/:draftId/confirm', controller.confirmDraft);

export { apiarySchedulesRouter };
export default router;
