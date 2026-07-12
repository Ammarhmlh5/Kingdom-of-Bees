import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { apiaryOperationsRepository } from '../repositories/apiary-operations.repository';
import { ApiResponse } from '../utils/response';

export class ApiaryOperationsController {
    async getOperations(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { operationType, startDate, endDate, assessmentType } = req.query;

            const operations = await apiaryOperationsRepository.getOperations(apiaryId, {
                operationType: operationType as string | undefined,
                startDate: startDate as string | undefined,
                endDate: endDate as string | undefined,
                assessmentType: assessmentType as string | undefined
            });
            ApiResponse.success(res, operations);
        } catch (error) {
            ApiResponse.error(res, 'فشل في جلب سجل العمليات', 500);
        }
    }

    async updateOperation(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { operationId } = req.params;
            const { description, operationDate, data: extraData } = req.body;

            const result = await apiaryOperationsRepository.updateOperation(operationId, apiaryId, {
                description, operationDate, extraData
            });

            if (!result) {
                return ApiResponse.error(res, 'العملية غير موجودة', 404);
            }
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, 'فشل في تعديل العملية', 500);
        }
    }

    async deleteOperation(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { operationId } = req.params;

            const result = await apiaryOperationsRepository.deleteOperation(operationId, apiaryId);
            if (!result) {
                return ApiResponse.error(res, 'العملية غير موجودة', 404);
            }
            ApiResponse.success(res, null, 'تم حذف العملية بنجاح');
        } catch (error) {
            ApiResponse.error(res, 'فشل في حذف العملية', 500);
        }
    }
}

export const apiaryOperationsController = new ApiaryOperationsController();
