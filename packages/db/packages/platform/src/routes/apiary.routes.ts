/**
 * Apiary Routes
 */

import { Router } from 'express';
import { ApiaryController } from '../controllers/apiary.controller';
import { hasApiaryAccess, isApiaryOwner } from '../middleware/auth.middleware';

const router = Router();
const apiaryController = new ApiaryController();

// GET /api/apiaries
router.get('/', apiaryController.getAll);

// POST /api/apiaries
router.post('/', apiaryController.create);

// GET /api/apiaries/:id
router.get('/:id', hasApiaryAccess, apiaryController.getById);

// PUT /api/apiaries/:id
router.put('/:id', isApiaryOwner, apiaryController.update);

// DELETE /api/apiaries/:id
router.delete('/:id', isApiaryOwner, apiaryController.delete);

// GET /api/apiaries/:id/hives
router.get('/:id/hives', hasApiaryAccess, apiaryController.getHives);

// GET /api/apiaries/:id/stats
router.get('/:id/stats', hasApiaryAccess, apiaryController.getStats);

// GET /api/apiaries/:id/members
router.get('/:id/members', hasApiaryAccess, apiaryController.getMembers);

// POST /api/apiaries/:id/members
router.post('/:id/members', isApiaryOwner, apiaryController.inviteMember);

// DELETE /api/apiaries/:id/members/:memberId
router.delete('/:id/members/:memberId', isApiaryOwner, apiaryController.removeMember);

export default router;

