import { Router } from 'express';
import { weatherController } from '../controllers/weather.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/current/:apiaryId', weatherController.getCurrentWeather.bind(weatherController));
router.get('/forecast/:apiaryId', weatherController.getForecast.bind(weatherController));

export default router;
