
import { Request, Response } from 'express';
import { DiseaseService } from '../services/disease.service';
import { PrismaClientValidationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

const service = new DiseaseService();

export class DiseaseController {

    async getActive(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const diseases = await service.getActiveDiseases(apiaryId);
            ApiResponse.success(res, diseases);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            ApiResponse.error(res, 'Failed to fetch diseases', 500);
        }
    }

    async getLibrary(_req: Request, res: Response) {
        try {
            const library = await service.getLibrary();
            ApiResponse.success(res, library);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            ApiResponse.error(res, 'Failed to fetch disease library', 500);
        }
    }

    async reportOutbreak(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { diseaseId, hiveIds, date, notes, treatmentId } = req.body;

            const record = await service.reportOutbreak(apiaryId, user.id, {
                diseaseId, hiveIds, date, notes, treatmentId
            });
            ApiResponse.created(res, record);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async resolve(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const recordId = req.params.recordId as string;
            const { outcome } = req.body;

            const result = await service.resolveDisease(apiaryId, recordId, outcome);
            ApiResponse.success(res, result);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            ApiResponse.error(res, 'Failed to resolve disease record', 500);
        }
    }

    async getAllDiseases(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user!;
            const records = await service.getAllUserDiseases(user.id);
            ApiResponse.success(res, records);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            ApiResponse.error(res, 'Failed to fetch all disease records', 500);
        }
    }

    async deleteDisease(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const recordId = req.params.recordId as string;
            await service.deleteDiseaseRecord(apiaryId, recordId);
            ApiResponse.success(res, null);
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                return ApiResponse.error(res, 'Invalid field value', 400);
            }
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
                return ApiResponse.error(res, 'Cannot delete: related records exist', 409);
            }
            ApiResponse.error(res, 'Failed to delete disease', 500);
        }
    }
}
