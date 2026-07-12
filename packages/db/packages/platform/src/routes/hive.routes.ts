/**
 * Hive Routes
 */

import { Router } from 'express';
import { HiveController } from '../controllers/hive.controller';

const router = Router();
const hiveController = new HiveController();

// GET /api/hives (all hives for current user)
router.get('/', hiveController.getAll);

// POST /api/hives
router.post('/', hiveController.create);

// GET /api/hives/:id
router.get('/:id', hiveController.getById);

// PUT /api/hives/:id
router.put('/:id', hiveController.update);

// DELETE /api/hives/:id
router.delete('/:id', hiveController.delete);

// GET /api/hives/:id/frames
router.get('/:id/frames', hiveController.getFrames);

// PUT /api/hives/:id/frames
router.put('/:id/frames', hiveController.updateFrames);

// GET /api/hives/:id/inspections
router.get('/:id/inspections', hiveController.getInspections);

// GET /api/hives/:id/stats
router.get('/:id/stats', hiveController.getStats);

export default router;

