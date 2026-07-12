import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';
import { PlantController } from '../controllers/plant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Weather
router.get('/weather/:apiaryId/current', WeatherController.getCurrent);
router.post('/weather/:apiaryId/manual', WeatherController.recordManual);
router.get('/weather/:apiaryId/forecast', WeatherController.getForecast);

// Plants
router.get('/plants/library/search', PlantController.searchLibrary);
router.get('/plants/apiary/:apiaryId', PlantController.getApiaryPlants);
router.post('/plants/local', PlantController.addLocalPlant);
router.put('/plants/local/:id', PlantController.updateLocalPlant);
router.delete('/plants/local/:id', PlantController.removeLocalPlant);

export default router;
