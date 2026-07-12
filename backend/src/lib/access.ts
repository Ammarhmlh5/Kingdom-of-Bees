import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export interface AccessResult {
  hasAccess: boolean;
  role: 'owner' | 'assistant' | null;
}

export async function hasApiaryAccess(
  userId: string,
  apiaryId: string
): Promise<AccessResult> {
  try {
    const apiary = await prisma.apiary.findUnique({
      where: { id: apiaryId },
      select: { ownerId: true },
    });

    if (!apiary) {
      return { hasAccess: false, role: null };
    }

    if (apiary.ownerId === userId) {
      return { hasAccess: true, role: 'owner' };
    }

    const membership = await prisma.apiaryMembership.findFirst({
      where: {
        apiaryId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (membership) {
      return { hasAccess: true, role: 'assistant' };
    }

    return { hasAccess: false, role: null };
  } catch (error) {
    logger.error(`[hasApiaryAccess] Error for apiaryId=${apiaryId}:`, error);
    return { hasAccess: false, role: null };
  }
}
