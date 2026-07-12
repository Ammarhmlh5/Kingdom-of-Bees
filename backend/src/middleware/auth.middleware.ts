
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser, UserRole, AuthenticatedRequest } from '../types/auth.types';
import prisma from '../config/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';

const JWT_SECRET = config.jwt.secret;

interface JwtPayload {
    sub: string; // authId
    email: string;
    role?: string;
}

/**
 * Global Guard: Verifies valid JWT and hydration of UserProfile
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;

    const token = authHeader
        ? authHeader.split(' ')[1]
        : cookieToken;

    if (!token) {
        return res.status(401).json({ error: 'No authorization token' });
    }

    try {
        // 1. Verify Token with signature validation
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        // 2. Hydrate UserProfile from DB
        // We MUST fetch from our DB to get the real UserProfile ID and Role
        const userProfile = await prisma.userProfile.findUnique({
            where: { authId: decoded.sub },
            select: { id: true, authId: true, email: true, userType: true }
        });

        if (!userProfile) {
            return res.status(401).json({ error: 'User profile not found. Please complete registration.' });
        }

        // 3. Attach to Request
        // Map Prisma UserType to our internal roles
        let role: UserRole = 'OWNER';
        if (userProfile.userType === 'WORKER') role = 'WORKER';
        if (userProfile.userType === 'ADMIN') role = 'ADMIN';

        (req as AuthenticatedRequest).user = {
            id: userProfile.id,
            authId: userProfile.authId,
            email: userProfile.email,
            role: role
        };

        next();
    } catch (error) {
        logger.error('Auth Guard Error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Apiary Guard: Ensures the user has access to the specific apiaryId in parameters
 */
export const requireApiaryAccess = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user as AuthUser;
    const apiaryId = req.params.apiaryId || req.body.apiaryId || req.query.apiaryId;

    logger.info(`[AuthGuard] Checking Access. User: ${user?.id}, ApiaryId Param: ${apiaryId}, URL: ${req.originalUrl}`);
    logger.info(`[AuthGuard] Params:`, req.params);

    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!apiaryId) {
        return res.status(400).json({ error: 'Apiary Context Missing (apiaryId required)' });
    }

    try {
        // 1. If Owner, check if they own the apiary
        if (user.role === 'OWNER') {
            try {
                const apiary = await prisma.apiary.findFirst({
                    where: {
                        id: String(apiaryId),
                        ownerId: user.id
                    }
                });

                if (!apiary) {
                    return res.status(403).json({ error: 'Access Denied: You do not own this apiary.' });
                }

                (req as AuthenticatedRequest).apiaryId = apiary.id;
                return next();
            } catch (queryError) {
                logger.error(`[AuthGuard] DB query error for apiaryId=${apiaryId}:`, queryError);
                return res.status(403).json({ error: 'Access Denied: You do not own this apiary.' });
            }
        }

        // 2. If Worker, check membership
        if (user.role === 'WORKER') {
            try {
                const membership = await prisma.apiaryMembership.findUnique({
                    where: {
                        apiaryId_userId: {
                            apiaryId: String(apiaryId),
                            userId: user.id
                        }
                    }
                });

                if (!membership || membership.status !== 'ACTIVE') {
                    return res.status(403).json({ error: 'Access Denied: Not an active member of this apiary.' });
                }

                (req as AuthenticatedRequest).apiaryId = String(apiaryId);
                return next();
            } catch (queryError) {
                logger.error(`[AuthGuard] DB query error for apiaryId=${apiaryId}:`, queryError);
                return res.status(403).json({ error: 'Access Denied: Not an active member of this apiary.' });
            }
        }

        // 3. If Admin, allow all access
        if (user.role === 'ADMIN') {
            (req as AuthenticatedRequest).apiaryId = String(apiaryId);
            return next();
        }

        return res.status(403).json({ error: 'Access Denied: Unknown role.' });

    } catch (error) {
        logger.error('Apiary Guard Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
