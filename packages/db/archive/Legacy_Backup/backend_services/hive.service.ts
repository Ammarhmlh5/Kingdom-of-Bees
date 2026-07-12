import { hiveRepository } from '../repositories/hive.repository';
import { AppError } from '../middleware/error.middleware';

export class HiveService {
    async getAll(userId: string) {
        return hiveRepository.findAll(userId);
    }

    async getById(id: string, userId: string) {
        const hive = await hiveRepository.findById(id, userId);
        if (!hive) {
            throw new AppError('Hive not found', 404);
        }
        return hive;
    }

    async create(data: any, userId: string) {
        try {
            return await hiveRepository.create(data, userId);
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to create hive', 400);
        }
    }

    async update(id: string, data: any, userId: string) {
        try {
            return await hiveRepository.update(id, data, userId);
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to update hive', 400);
        }
    }

    async delete(id: string, userId: string) {
        try {
            return await hiveRepository.delete(id, userId);
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to delete hive', 400);
        }
    }
}

export const hiveService = new HiveService();
