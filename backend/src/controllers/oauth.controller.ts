import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

const authService = new AuthService();
const JWT_SECRET = config.jwt.secret;

export class OAuthController {
    /**
     * POST /auth/google - Google OAuth login/register
     */
    async googleAuth(req: Request, res: Response) {
        try {
            const { googleId, email, fullName, avatarUrl } = req.body;

            if (!googleId || !email) {
                return ApiResponse.error(res, 'Missing Google credentials', 400);
            }

            // Check if user exists by googleId or email
            let user = await authService.findByGoogleId(googleId);

            if (!user) {
                // Check by email
                user = await authService.findByEmail(email);

                if (user) {
                    // Link Google account to existing user
                    user = await authService.linkGoogleAccount(user.id, googleId);
                } else {
                    // Create new user with Google
                    user = await authService.registerWithGoogle({
                        googleId,
                        email,
                        fullName: fullName || email.split('@')[0],
                        avatarUrl,
                        userType: 'OWNER' // Default to OWNER
                    });
                }
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

            ApiResponse.success(res, { user: userResponse, accessToken: token });
        } catch (error) {
            logger.error('Google OAuth error:', error);
            ApiResponse.error(res, 'Google authentication failed', 500);
        }
    }
}
