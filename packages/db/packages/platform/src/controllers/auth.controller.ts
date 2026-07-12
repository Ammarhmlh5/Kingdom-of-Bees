/**
 * Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import { supabase, prisma } from '../server';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, phone } = req.body;

      // Validate input
      if (!email || !password || !fullName) {
        throw new AppError(400, 'Email, password, and full name are required');
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new AppError(400, authError.message);
      }

      if (!authData.user) {
        throw new AppError(500, 'User creation failed');
      }

      // Create user profile in database
      const userProfile = await prisma.userProfile.create({
        data: {
          authId: authData.user.id,
          email,
          fullName,
          phone: phone || null,
          userType: 'EXPLORER',
        },
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.fullName,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Get user profile
      const userProfile = await prisma.userProfile.findUnique({
        where: { authId: data.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          userType: true,
          avatarUrl: true,
        },
      });

      if (!userProfile) {
        throw new AppError(404, 'User profile not found');
      }

      // Update last login
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { lastLoginAt: new Date() },
      });

      res.json({
        message: 'Login successful',
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
        user: userProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError(400, 'Refresh token is required');
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new AppError(401, 'Invalid refresh token');
      }

      res.json({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await supabase.auth.signOut(token);
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError(400, 'Email is required');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new AppError(400, 'Token and password are required');
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
}

