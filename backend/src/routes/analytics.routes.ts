import { Router } from 'express';
import { getApiaryAnalytics } from '../controllers/analytics.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';

const router = Router();

// GET /api/apiaries/:apiaryId/analytics — Predictions and accuracy summary
router.get('/:apiaryId/analytics', requireAuth, requireApiaryAccess, getApiaryAnalytics);

export default router;
