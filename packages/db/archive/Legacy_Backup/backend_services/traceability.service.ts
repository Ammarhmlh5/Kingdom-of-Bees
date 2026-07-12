
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

// Mock service for Traceability until schema is ready
export class TraceabilityService {
    async getBatchInfo(batchId: string) {
        throw new AppError('Traceability Service not implemented', 501);
    }
}
export const traceabilityService = new TraceabilityService();
