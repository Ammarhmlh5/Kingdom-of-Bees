import { Router } from 'express';
import { AdminDiseaseController } from '../controllers/admin-disease.controller';
import { adminLogsController } from '../controllers/admin-logs.controller';
import { adminDashboardController } from '../controllers/admin-dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../validators';
import { createDiseaseSchema, updateDiseaseSchema, createTreatmentSchema, updateTreatmentSchema } from '../validators/disease.schema';

const router = Router();
const controller = new AdminDiseaseController();

// Require auth + admin role for all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// ----------------------------------------------------
// Dashboard Admin Routes
// ----------------------------------------------------
router.get('/stats', adminDashboardController.getStats.bind(adminDashboardController));
router.get('/activities', adminDashboardController.getActivities.bind(adminDashboardController));
router.get('/users', adminDashboardController.getUsers.bind(adminDashboardController));

// ----------------------------------------------------
// Disease Library Admin Routes
// ----------------------------------------------------
router.get('/diseases', controller.getAllDiseases.bind(controller));
router.post('/diseases', validate(createDiseaseSchema), controller.createDisease.bind(controller));
router.get('/diseases/:id', controller.getDiseaseById.bind(controller));
router.put('/diseases/:id', validate(updateDiseaseSchema), controller.updateDisease.bind(controller));
router.delete('/diseases/:id', controller.deleteDisease.bind(controller));

// ----------------------------------------------------
// Disease Treatments Admin Routes
// ----------------------------------------------------
router.get('/diseases/:diseaseId/treatments', controller.getTreatmentsByDisease.bind(controller));
router.post('/diseases/:diseaseId/treatments', validate(createTreatmentSchema), controller.createTreatment.bind(controller));
router.put('/treatments/:id', validate(updateTreatmentSchema), controller.updateTreatment.bind(controller));
router.delete('/treatments/:id', controller.deleteTreatment.bind(controller));

// ----------------------------------------------------
// Activity Logs Admin Routes
// ----------------------------------------------------
router.get('/logs', adminLogsController.getLogs.bind(adminLogsController));
router.get('/logs/stats', adminLogsController.getLogStats.bind(adminLogsController));

export default router;
