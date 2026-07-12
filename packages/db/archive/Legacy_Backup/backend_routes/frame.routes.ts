import { Router } from 'express';
import frameController from '../controllers/frame.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Hive frames routes
router.get('/hives/:hiveId/frames', frameController.getHiveFrames);
router.post('/hives/:hiveId/frames', frameController.createFrame);

// Individual frame routes
router.get('/frames/:frameId', frameController.getFrame);
router.put('/frames/:frameId', frameController.updateFrame);
router.delete('/frames/:frameId', frameController.deleteFrame);

// Frame history routes
router.get('/frames/:frameId/history', frameController.getFrameHistory);
router.post('/frames/:frameId/snapshots', frameController.createSnapshot);

export default router;
