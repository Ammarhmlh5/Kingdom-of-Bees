import { Router } from 'express';
import { operationsController } from '../controllers/operations.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All operations routes require authentication
router.use(requireAuth);

// ==========================================
// DAILY OPERATIONS ROUTES (Main Tab)
// ==========================================

/**
 * GET /api/operations/daily
 * Get daily operations with filters
 * Query params: apiaryId, startDate, endDate, operationType, performedBy
 */
router.get('/daily', operationsController.getDailyOperations.bind(operationsController));

/**
 * GET /api/operations/stats
 * Get operation statistics
 * Query params: apiaryId, startDate, endDate
 */
router.get('/stats', operationsController.getOperationStats.bind(operationsController));

/**
 * GET /api/operations/types
 * Get all operation types with Arabic labels
 */
router.get('/types', operationsController.getOperationTypes.bind(operationsController));

/**
 * DELETE /api/operations/:operationId
 * Delete operation (rollback)
 */
router.delete('/:operationId', operationsController.deleteOperation.bind(operationsController));

export default router;
