import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../utils/response';

const prisma = new PrismaClient();

// Middleware to verify apiary ownership and attach apiary to request
export async function verifyApiaryOwnership(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { apiaryId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        const apiary = await prisma.apiary.findFirst({
            where: {
                id: apiaryId,
                ownerId: userId,
            },
        });

        if (!apiary) {
            return ApiResponse.forbidden(res, 'Access denied to this apiary');
        }

        // Attach apiary to request for use in controllers
        (req as any).apiary = apiary;
        next();
    } catch (error) {
        next(error);
    }
}

// Create router for apiary-scoped routes
const router = Router({ mergeParams: true });

// Apply ownership verification to all routes
router.use(verifyApiaryOwnership);

// Import controllers (will create these next)
import { ApiaryStatsController } from '../controllers/apiary-stats.controller';
import { hiveController } from '../controllers/hive.controller';
import { feedingController } from '../controllers/feeding.controller';
import { inspectionController } from '../controllers/inspection.controller';

const statsController = new ApiaryStatsController();

// ============================================================================
// APIARY-SCOPED ROUTES
// ============================================================================

// Dashboard & Stats
router.get('/stats', statsController.getStats.bind(statsController));

// Hives
// Hives
router.get('/hives', hiveController.getAll.bind(hiveController));
router.post('/hives', hiveController.create.bind(hiveController));
// router.get('/hives/analytics', hiveController.getAnalytics.bind(hiveController));
router.get('/hives/:hiveId', hiveController.getById.bind(hiveController));
router.put('/hives/:hiveId', hiveController.update.bind(hiveController));
router.delete('/hives/:hiveId', hiveController.delete.bind(hiveController));

// Feeding
router.get('/feeding', feedingController.getAll.bind(feedingController));
router.post('/feeding', feedingController.create.bind(feedingController));
router.get('/feeding/types', feedingController.getTypes.bind(feedingController));
router.get('/feeding/summary', feedingController.getSummary.bind(feedingController));
router.get('/feeding/recommendations', feedingController.getApiaryRecommendations.bind(feedingController));
router.get('/feeding/recommendations/:hiveId', feedingController.getRecommendations.bind(feedingController));

// Inspections
router.get('/inspections', inspectionController.getAll.bind(inspectionController));
router.post('/inspections', inspectionController.create.bind(inspectionController));
// router.get('/inspections/summary', inspectionController.getSummary.bind(inspectionController));
router.get('/inspections/:inspectionId', inspectionController.getById.bind(inspectionController));

// Health (will implement later)
// router.get('/health', healthController.getAll.bind(healthController));
// router.get('/health/overview', healthController.getOverview.bind(healthController));

// Harvest (will implement later)
// router.get('/harvest', harvestController.getAll.bind(harvestController));
// router.get('/harvest/summary', harvestController.getSummary.bind(harvestController));

// Alerts (will implement later)
// router.get('/alerts', alertController.getAll.bind(alertController));

export default router;
