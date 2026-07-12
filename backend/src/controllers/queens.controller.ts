import { Request, Response } from 'express';
import { queensService } from '../services/queens.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class QueensController {
    async getQueens(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const queens = await queensService.getQueensByApiary(apiaryId);
            ApiResponse.success(res, queens);
        } catch (error) {
            ApiResponse.error(res, 'فشل في جلب الملكات', 500);
        }
    }

    async createQueen(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const userId = (req as AuthenticatedRequest).user?.id || 'system';
            const { queenNumber, source, beeBreedId, birthDate, introductionDate, marked, markColor, hiveId } = req.body;

            if (!source) {
                return ApiResponse.error(res, 'مصدر الملكة مطلوب', 400);
            }

            const queen = await queensService.createQueen(apiaryId, userId, {
                queenNumber, source, beeBreedId, birthDate, introductionDate, marked, markColor, hiveId
            });
            ApiResponse.created(res, queen);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async deleteQueen(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { queenId } = req.params;
            await queensService.deleteQueen(queenId, apiaryId);
            ApiResponse.success(res, null, 'تم حذف الملكة بنجاح');
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 404);
        }
    }
}

export const queensController = new QueensController();
