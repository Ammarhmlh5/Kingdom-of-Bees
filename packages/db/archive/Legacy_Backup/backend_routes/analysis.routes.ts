import { Router } from 'express';
import analysisController from '../controllers/analysis.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Hive analysis routes
router.get('/hives/:hiveId/analysis', analysisController.analyzeHive);
router.get('/hives/:hiveId/strength', analysisController.getHiveStrength);
router.get('/hives/:hiveId/feeding-need', analysisController.getFeedingNeed);
router.get('/hives/:hiveId/swarm-risk', analysisController.getSwarmRisk);
router.get('/hives/:hiveId/trends', analysisController.getTrends);
router.get('/hives/:hiveId/recommendations', analysisController.getRecommendations);
router.get('/hives/:hiveId/stats', analysisController.getStats);

export default router;
