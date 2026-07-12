import { Router } from 'express';
import { DiseaseController } from '../controllers/disease.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Used by all
router.use(authenticate);

// --- Disease Library (Public to all authenticated users) ---
router.get('/', DiseaseController.getDiseases);
router.get('/records/nearby', DiseaseController.getNearbyDiseases); // Place specific routes before :id
router.get('/:id', DiseaseController.getDisease);
router.get('/:id/treatments', DiseaseController.getTreatments);

// Create Record
router.post('/records', DiseaseController.createRecord as any);

// Update Record
router.put('/records/:id', DiseaseController.updateRecord);

router.get('/my-records', DiseaseController.getUserRecords as any);

// List Records for Apiary
router.get('/apiary/:apiaryId/records', DiseaseController.getApiaryRecords);

export default router;
