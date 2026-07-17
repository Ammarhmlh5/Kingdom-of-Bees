import { Request, Response } from 'express';
import { simulationService } from '../services/simulation.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class SimulationController {
  /**
   * POST /api/apiaries/:apiaryId/simulate
   * Run predictive simulation
   */
  async runSimulation(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const simulationRequest = req.body;

      // Validate required fields
      if (!simulationRequest.scope) {
        return ApiResponse.error(res, 'يجب تحديد نطاق المحاكاة (HIVE/HIVES/APIARY)', 400);
      }

      if (simulationRequest.scope !== 'APIARY' && (!simulationRequest.hiveIds || simulationRequest.hiveIds.length === 0)) {
        return ApiResponse.error(res, 'يجب تحديد الخلايا للمحاكاة', 400);
      }

      // Set default duration if not provided
      if (!simulationRequest.duration) {
        simulationRequest.duration = 12; // Default 12 months
      }

      // Set default factors if not provided
      if (!simulationRequest.factors) {
        simulationRequest.factors = {
          includeWeather: true,
          includeBeekeeper: true,
          includeSeasons: true
        };
      }

      const result = await simulationService.runSimulation(
        apiaryId,
        userId,
        simulationRequest
      );

      ApiResponse.created(res, result, 'تم إنشاء المحاكاة بنجاح');
    } catch (error) {
      logger.error('Error running simulation:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'فشل في تشغيل المحاكاة', 500);
    }
  }

  /**
   * GET /api/apiaries/:apiaryId/hives/:hiveId/simulations
   * Get simulation history for a hive
   */
  async getSimulationHistory(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      // Simulation history is not persisted in the database yet
      // Return empty array for now
      ApiResponse.success(res, [], 'سجل المحاكاة فارغ حالياً');
    } catch (error) {
      logger.error('Error fetching simulation history:', error);
      ApiResponse.error(res, 'فشل في جلب سجل المحاكاة', 500);
    }
  }
}

export const simulationController = new SimulationController();
