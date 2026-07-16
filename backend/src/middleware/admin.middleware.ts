import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
        return ApiResponse.unauthorized(res);
    }

    const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        select: { userType: true }
    });

    if (user?.userType !== 'ADMIN') {
        return ApiResponse.forbidden(res, 'هذه الصفحة متاحة للمديرين فقط');
    }

    next();
}
