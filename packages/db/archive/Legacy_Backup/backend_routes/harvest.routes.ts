import { Router } from 'express';
import { harvestController } from '../controllers/harvest.controller';

const router = Router();

// Main harvest records
router.post('/', harvestController.create.bind(harvestController));
router.get('/', harvestController.getAll.bind(harvestController));
router.get('/:id', harvestController.getById.bind(harvestController));
router.put('/:id', harvestController.update.bind(harvestController));
router.delete('/:id', harvestController.delete.bind(harvestController));

// Honey harvest
router.post('/honey', harvestController.createHoneyHarvest.bind(harvestController));
router.get('/honey/list', harvestController.getHoneyHarvests.bind(harvestController));

// Pollen harvest
router.post('/pollen', harvestController.createPollenHarvest.bind(harvestController));
router.get('/pollen/list', harvestController.getPollenHarvests.bind(harvestController));

// Royal jelly production
router.post('/royal-jelly', harvestController.createRoyalJellyProduction.bind(harvestController));
router.get('/royal-jelly/list', harvestController.getRoyalJellyProductions.bind(harvestController));

// Statistics
router.get('/stats/:apiaryId', harvestController.getProductionStats.bind(harvestController));

export default router;
