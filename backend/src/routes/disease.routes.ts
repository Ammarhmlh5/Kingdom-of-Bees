
import { Router } from 'express';
import { DiseaseController } from '../controllers/disease.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { reportOutbreakSchema, resolveDiseaseSchema } from '../validators/disease.schema';

const router = Router({ mergeParams: true });
const controller = new DiseaseController();

router.use(requireAuth);
router.use(requireApiaryAccess);

router.get('/', controller.getActive); // Active outbreaks
router.get('/library', controller.getLibrary); // Global list

router.post('/', validate(reportOutbreakSchema), controller.reportOutbreak);
router.put('/:recordId/resolve', validate(resolveDiseaseSchema), controller.resolve);

export default router;
