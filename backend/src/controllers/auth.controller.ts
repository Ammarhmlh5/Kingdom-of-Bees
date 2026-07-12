
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthUser, AuthenticatedRequest } from '../types/auth.types';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

const authService = new AuthService();
const JWT_SECRET = config.jwt.secret;

const setTokenCookie = (res: Response, token: string) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export class AuthController {

    /**
     * POST /auth/login - Syncs Supabase user to our DB
     */
    /**
     * POST /auth/register - Create new account
     */
    async register(req: Request, res: Response) {
        try {
            const { email, password, fullName, userType } = req.body;
            logger.info('[Register] Received:', { email, fullName, userType, hasPassword: !!password });

            if (!email || !password || !fullName) {
                logger.info('[Register] REJECTED: Missing fields', { email: !!email, password: !!password, fullName: !!fullName });
                return ApiResponse.error(res, 'Missing required fields', 400);
            }

            const user = await authService.registerUser({
                email,
                password,
                fullName,
                userType: userType || 'OWNER'
            });

            // Generate JWT immediately upon registration
            const token = jwt.sign(
                { sub: user.authId, id: user.id, email: user.email, role: user.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Map userType to role for frontend compatibility
            const userResponse = {
                ...user,
                role: user.userType
            };

            logger.info('[Register] SUCCESS:', user.email);
            setTokenCookie(res, token);
            ApiResponse.success(res, { user: userResponse, accessToken: token });
        } catch (error) {
            logger.error('[Register] ERROR:', (error as Error).message);
            ApiResponse.error(res, (error as Error).message, 400);
        }
    }

    /**
     * POST /auth/login - Login with email/password
     */
    async login(req: Request, res: Response) {
        try {
            const { email, password, id } = req.body; // 'id' might be sent by old frontend, ignore it

            // Allow password OR id (legacy/auto-login) but prefer password
            const pwd = password || id;

            if (!email || !pwd) return ApiResponse.error(res, 'Missing credentials', 400);

            const user = await authService.validateUser(email, pwd);

            if (!user) {
                return ApiResponse.unauthorized(res, 'Invalid credentials');
            }

            // Generate JWT
            const token = jwt.sign(
                { sub: user.authId, id: user.id, email: user.email, role: user.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Map userType to role for frontend compatibility
            const userResponse = {
                ...user,
                role: user.userType
            };

            setTokenCookie(res, token);
            ApiResponse.success(res, {
                user: userResponse,
                accessToken: token
            });
        } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error));
            ApiResponse.error(res, 'Login failed', 500);
        }
    }

    /**
     * POST /auth/invite - Generates an invite code (OWNER only)
     */
    async generateInvite(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const { apiaryId, role } = req.body;

            if (user.role !== 'OWNER') {
                return ApiResponse.forbidden(res, 'Only owners can invite members');
            }

            const code = await authService.generateInviteCode(user.id, apiaryId, role);
            ApiResponse.success(res, { code });
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    /**
     * POST /auth/join - Worker joins via code
     */
    async joinApiary(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const { inviteCode } = req.body;

            if (!inviteCode) return ApiResponse.error(res, 'Invite code required', 400);

            const membership = await authService.joinApiary(user.id, inviteCode);
            ApiResponse.success(res, { membership });
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 400);
        }
    }

    /**
     * GET /auth/me - Get current user from token (cookie or header)
     */
    async me(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user;
            if (!user) {
                return ApiResponse.unauthorized(res, 'Not authenticated');
            }
            ApiResponse.success(res, { user });
        } catch (error) {
            ApiResponse.unauthorized(res, 'Not authenticated');
        }
    }

    /**
     * POST /auth/logout - Clear auth cookie
     */
    async logout(_req: Request, res: Response) {
        res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        ApiResponse.success(res, null, 'تم تسجيل الخروج');
    }
}
