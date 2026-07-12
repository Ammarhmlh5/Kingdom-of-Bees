
import { Router } from 'express';
import { HiveController } from '../controllers/hive.controller';
import { inspectionController } from '../controllers/inspection.controller';
import { assessmentController } from '../controllers/assessment.controller';
import { splitController } from '../controllers/split.controller';
import { mergeController } from '../controllers/merge.controller';
import { superController } from '../controllers/super.controller';
import { simulationController } from '../controllers/simulation.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createHiveSchema, updateHiveSchema, updateFramesSchema, setupHiveSchema, splitHiveSchema, mergeHivesSchema, addSuperSchema } from '../validators/hive.schema';
import { recordInspectionSchema } from '../validators/inspection.schema';
import { recordFlightAssessmentSchema, recordPollenAssessmentSchema } from '../validators/assessment.schema';

const router = Router({ mergeParams: true }); // Important: mergeParams to access :apiaryId from parent router if strictly nested
const controller = new HiveController();

// All Hive routes must normally be within a valid Apiary Scope (Check logic in index.ts)
// NOTE: We will mount this at /apiaries/:apiaryId/hives
// So :apiaryId is in params.

router.use(requireAuth);
router.use(requireApiaryAccess);

// ==========================================
// INSPECTION ROUTES
// ==========================================
router.get('/inspection-queue', inspectionController.getInspectionQueue.bind(inspectionController));
router.put('/priorities', inspectionController.updatePriorities.bind(inspectionController));

// ==========================================
// FLIGHT & POLLEN ASSESSMENTS
// ==========================================
router.post('/:hiveId/assessments/flight', validate(recordFlightAssessmentSchema), assessmentController.recordFlightAssessment.bind(assessmentController));
router.post('/:hiveId/assessments/pollen', validate(recordPollenAssessmentSchema), assessmentController.recordPollenAssessment.bind(assessmentController));

// ==========================================
// BASIC HIVE CRUD
// ==========================================
router.get('/', controller.getHives);
router.post('/', validate(createHiveSchema), controller.create);

// Frame routes MUST come before /:hiveId to avoid matching "frames" as hiveId
router.get('/:hiveId/frames', controller.getFrames);
router.put('/:hiveId/frames', validate(updateFramesSchema), controller.updateFrames);

router.get('/:hiveId', controller.getDetails);
router.put('/:hiveId', validate(updateHiveSchema), controller.update);
router.delete('/:hiveId', controller.delete);

// ==========================================
// HIVE OPERATIONS
// ==========================================
router.post('/:hiveId/setup', validate(setupHiveSchema), controller.setup);
router.post('/:hiveId/inspect', validate(recordInspectionSchema), inspectionController.recordInspection.bind(inspectionController));
router.post('/:hiveId/split', validate(splitHiveSchema), splitController.executeSplit.bind(splitController));
router.post('/:hiveId/merge', validate(mergeHivesSchema), mergeController.executeMerge.bind(mergeController));
router.post('/:hiveId/super', validate(addSuperSchema), superController.addSuper.bind(superController));

// ==========================================
// SPLIT ROUTES
// ==========================================
router.get('/split-candidates', splitController.getSplitCandidates.bind(splitController));

// ==========================================
// MERGE ROUTES
// ==========================================
router.get('/merge-candidates', mergeController.getMergeCandidates.bind(mergeController));

// ==========================================
// SUPER ROUTES
// ==========================================
router.get('/super-candidates', superController.getSuperCandidates.bind(superController));

// ==========================================
// ASSESSMENT ROUTES
// ==========================================


// ==========================================
// SIMULATION ROUTES
// ==========================================
router.get('/:hiveId/simulations', simulationController.getSimulationHistory.bind(simulationController));

export default router;
