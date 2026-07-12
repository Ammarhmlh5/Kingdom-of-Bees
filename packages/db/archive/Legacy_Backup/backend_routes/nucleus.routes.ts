import { Router } from 'express';
import { NucleusController } from '../controllers/nucleus.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', NucleusController.getNuclei);
router.get('/:id', NucleusController.getNucleus);
router.post('/', NucleusController.createNucleus);
router.put('/:id', NucleusController.updateNucleus);
router.post('/:id/graduate', NucleusController.graduate);
router.delete('/:id', NucleusController.deleteNucleus);

export default router;
