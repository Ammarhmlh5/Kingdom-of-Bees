
import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.post('/chat/start', AIController.startSession);
router.post('/chat/:sessionId/message', AIController.sendMessage);
router.get('/context/:userId', AIController.getUserContext);

export default router;
