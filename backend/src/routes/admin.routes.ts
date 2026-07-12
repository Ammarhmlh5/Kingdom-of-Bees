import { Router } from 'express';
import { AdminDiseaseController } from '../controllers/admin-disease.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createDiseaseSchema, updateDiseaseSchema, createTreatmentSchema, updateTreatmentSchema } from '../validators/disease.schema';

const router = Router();
const controller = new AdminDiseaseController();

// We can add a middleware to ensure the user is an admin or owner.
// For now, requireAuth ensures they are logged in, but you should enforce role based access in production.
router.use(requireAuth);

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
// Note: Getting treatments for a disease is done via the Disease Library include, 
// or specifically via this endpoint.
router.get('/diseases/:diseaseId/treatments', controller.getTreatmentsByDisease.bind(controller));
router.post('/diseases/:diseaseId/treatments', validate(createTreatmentSchema), controller.createTreatment.bind(controller));
router.put('/treatments/:id', validate(updateTreatmentSchema), controller.updateTreatment.bind(controller));
router.delete('/treatments/:id', controller.deleteTreatment.bind(controller));

export default router;
