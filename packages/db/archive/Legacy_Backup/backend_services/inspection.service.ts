import { inspectionRepository } from '../repositories/inspection.repository';
import { AppError } from '../middleware/error.middleware';

export class InspectionService {
    async getAll(userId: string) {
        return inspectionRepository.findAll(userId);
    }

    async getById(id: string, userId: string) {
        const inspection = await inspectionRepository.findById(id, userId);
        if (!inspection) {
            throw new AppError('Inspection not found', 404);
        }
        return inspection;
    }

    async create(data: any, userId: string) {
        try {
            return await inspectionRepository.create(data, userId);
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to create inspection', 400);
        }
    }
}

export const inspectionService = new InspectionService();
