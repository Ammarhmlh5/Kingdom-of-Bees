/**
 * Authentication Middleware
 * Verifies JWT token and loads user from Supabase
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../server';
import { prisma } from '../server';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        authId: string;
        email: string;
        userType: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Load user profile from database
    const userProfile = await prisma.userProfile.findUnique({
      where: { authId: data.user.id },
      select: {
        id: true,
        authId: true,
        email: true,
        userType: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found',
      });
    }

    if (!userProfile.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is inactive',
      });
    }

    // Attach user to request
    req.user = {
      id: userProfile.id,
      authId: userProfile.authId,
      email: userProfile.email,
      userType: userProfile.userType,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

/**
 * Check if user is apiary owner
 */
export const isApiaryOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiaryId = req.params.apiaryId || req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiary = await prisma.apiary.findUnique({
      where: { id: apiaryId },
      select: { ownerId: true },
    });

    if (!apiary) {
      return res.status(404).json({ error: 'Apiary not found' });
    }

    if (apiary.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Not apiary owner' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has access to apiary (owner or member)
 */
export const hasApiaryAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiaryId = req.params.apiaryId || req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if owner
    const apiary = await prisma.apiary.findFirst({
      where: {
        id: apiaryId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                status: 'ACTIVE',
              },
            },
          },
        ],
      },
    });

    if (!apiary) {
      return res.status(403).json({ error: 'Forbidden: No access to this apiary' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

