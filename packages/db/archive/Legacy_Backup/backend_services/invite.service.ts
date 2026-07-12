
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

// Mock service for Apiary Invites until schema is ready
export class InviteService {
    async generateInvite(apiaryId: string) {
        throw new AppError('Invite Service not implemented', 501);
    }
}
export const inviteService = new InviteService();
