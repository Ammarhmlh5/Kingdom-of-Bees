import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { userRepository } from '../repositories/user.repository';
// import { twoFactorService } from './two-factor.service';

// ...

// Check 2FA (Temporarily disabled)
// const is2FAEnabled = await twoFactorService.is2FAEnabled(user.id);
const is2FAEnabled = false;
import { AppError } from '../middleware/error.middleware';
import { UserProfile, UserWithPassword, AuthTokenPayload, RegisterData, AuthResponse } from '../types/user.types';

export class AuthService {
    async register(data: RegisterData): Promise<AuthResponse> {
        // Check if user exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        let user;
        try {
            user = await userRepository.create({
                authId: uuidv4(),
                email: data.email,
                fullName: data.fullName,
                userType: (data.userType || 'OWNER') as UserProfile['userType'],
                password: hashedPassword,
                isVerified: true,
                isActive: true,
            });
        } catch (error) {
            console.error('Database Error in Register:', error);
            throw error;
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async login(email: string, password: string): Promise<AuthResponse | { requires2FA: boolean; tempToken: string }> {
        const user = await userRepository.findByEmail(email);
        if (!user || !user.password) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if 2FA is enabled
        // const is2FAEnabled = await twoFactorService.is2FAEnabled(user.id);
        const is2FAEnabled = false;

        if (is2FAEnabled) {
            // Generate temporary token for 2FA verification
            const tempToken = jwt.sign(
                { userId: user.id, type: '2fa-pending' },
                config.jwt.secret,
                { expiresIn: '5m' }
            );

            return {
                requires2FA: true,
                tempToken,
            };
        }

        const tokens = this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async loginWith2FA(email: string, password: string, twoFactorToken: string): Promise<AuthResponse> {
        const user = await userRepository.findByEmail(email);
        if (!user || !user.password) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify 2FA token
        // const is2FAValid = await twoFactorService.verifyLoginToken(user.id, twoFactorToken);
        const is2FAValid = true;
        if (!is2FAValid) {
            throw new AppError('Invalid 2FA token', 401);
        }

        const tokens = this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    /**
     * Smart authentication: Login if user exists, register if new
     * Used for worker join flow
     */
    async loginOrRegister(data: {
        identifier: string; // email or phone
        password: string;
        fullName?: string;
        userType?: 'OWNER' | 'WORKER';
    }): Promise<AuthResponse> {
        // Try to find user by email
        let user = await userRepository.findByEmail(data.identifier);

        if (user) {
            // User exists - login
            if (!user.password) {
                throw new AppError('Invalid credentials', 401);
            }

            const isPasswordValid = await bcrypt.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid credentials', 401);
            }

            const tokens = this.generateTokens(user);
            return {
                user: this.sanitizeUser(user),
                ...tokens,
            };
        } else {
            // User doesn't exist - register
            if (!data.fullName) {
                throw new AppError('Full name is required for registration', 400);
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            user = await userRepository.create({
                authId: uuidv4(),
                email: data.identifier,
                fullName: data.fullName,
                userType: (data.userType || 'WORKER') as UserProfile['userType'],
                password: hashedPassword,
                isVerified: true,
                isActive: true,
            });

            const tokens = this.generateTokens(user);
            return {
                user: this.sanitizeUser(user),
                ...tokens,
            };
        }
    }

    private generateTokens(user: UserProfile | UserWithPassword): { accessToken: string; refreshToken: string } {
        const payload: AuthTokenPayload = {
            userId: user.id,
            email: user.email,
            userType: user.userType,
        };

        const accessToken = jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
        );

        return { accessToken, refreshToken };
    }

    async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return { message: 'If the email exists, a reset link has been sent' };
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'password-reset' },
            config.jwt.secret,
            { expiresIn: '1h' }
        );

        // TODO: Send email with reset link
        // For now, return token in response (in production, only send via email)
        console.log(`Password reset token for ${email}: ${resetToken}`);

        return {
            message: 'If the email exists, a reset link has been sent',
            resetToken, // Remove this in production
        };
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwt.secret) as any;

            if (decoded.type !== 'password-reset') {
                throw new AppError('Invalid reset token', 400);
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await userRepository.updatePassword(decoded.userId, hashedPassword);

            return { message: 'Password reset successfully' };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid or expired reset token', 400);
            }
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

            // Get user
            const user = await userRepository.findById(decoded.userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Generate new tokens
            return this.generateTokens(user);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid or expired refresh token', 401);
            }
            throw error;
        }
    }

    async logout(userId: string): Promise<{ message: string }> {
        // TODO: Implement token blacklist if needed
        // For now, just return success (client should delete tokens)
        return { message: 'Logged out successfully' };
    }

    async verifyEmail(token: string): Promise<{ message: string }> {
        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwt.secret) as any;

            if (decoded.type !== 'email-verification') {
                throw new AppError('Invalid verification token', 400);
            }

            // Update user verification status
            await userRepository.verifyEmail(decoded.userId);

            return { message: 'Email verified successfully' };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid or expired verification token', 400);
            }
            throw error;
        }
    }

    async sendVerificationEmail(userId: string): Promise<{ message: string; verificationToken?: string }> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.isVerified) {
            throw new AppError('Email already verified', 400);
        }

        // Generate verification token
        const verificationToken = jwt.sign(
            { userId: user.id, type: 'email-verification' },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        // TODO: Send email with verification link
        console.log(`Email verification token for ${user.email}: ${verificationToken}`);

        return {
            message: 'Verification email sent',
            verificationToken, // Remove this in production
        };
    }

    private sanitizeUser(user: UserWithPassword): UserProfile {
        const { password, ...sanitized } = user;
        return sanitized as UserProfile;
    }
}

export const authService = new AuthService();
