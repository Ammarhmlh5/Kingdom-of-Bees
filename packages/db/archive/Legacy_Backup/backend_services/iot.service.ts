
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

// Mock service for IoT until schema is ready
export class IoTService {
    async getDeviceConfig(deviceId: string) {
        throw new AppError('IoT Service not implemented', 501);
    }
}
export const iotService = new IoTService();
