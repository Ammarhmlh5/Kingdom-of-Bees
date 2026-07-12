
import { Router } from 'express';
import { IoTController } from '../controllers/iot.controller';

const router = Router();

router.post('/devices', IoTController.registerDevice);
router.post('/readings', IoTController.ingestReading);

export default router;
