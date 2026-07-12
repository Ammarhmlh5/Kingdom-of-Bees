
import { UserType } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';

import prisma from '../config/prisma';
const userRepo = new UserRepository();

export class AuthService {
    /**
     * Syncs user from Supabase Auth to strict UserProfile
     */
    /**
     * Registers a new user with password
     */
    async registerUser(data: { email: string; password?: string; fullName: string; userType?: UserType }) {
        const existing = await userRepo.findByEmail(data.email);
        if (existing) throw new Error('User already exists');

        const hashedPassword = data.password ? await import('bcrypt').then(m => m.hash(data.password!, 10)) : undefined;

        // Generate a proper UUID as local authId
        const authId = crypto.randomUUID();

        return userRepo.create({
            authId,
            email: data.email,
            fullName: data.fullName,
            role: data.userType,
            password: hashedPassword
        });
    }

    /**
     * Validates user credentials
     */
    async validateUser(email: string, password?: string) {
        const user = await userRepo.findByEmail(email);
        if (!user) return null;

        if (password && user.password) {
            const bcrypt = await import('bcrypt');
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;
        }

        return user;
    }

    /**
     * Legacy Sync (kept for compatibility, or unused)
     */
    async syncUser(authId: string, email: string, meta: any) {
        let user = await userRepo.findByAuthId(authId);
        if (!user) {
            user = await userRepo.create({
                authId,
                email,
                fullName: meta.full_name || email.split('@')[0],
                role: 'EXPLORER'
            });
        }
        return user;
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string) {
        return await userRepo.findByEmail(email);
    }

    /**
     * Find user by auth ID
     */
    async findByAuthId(authId: string) {
        return await prisma.userProfile.findUnique({
            where: { authId }
        });
    }

    /**
     * Register new user
     */
    async register(data: { email: string; fullName: string; avatarUrl?: string; userType?: UserType }) {
        const authId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return await userRepo.create({
            authId,
            email: data.email,
            fullName: data.fullName,
            role: data.userType || 'OWNER',
            avatarUrl: data.avatarUrl
        });
    }


    /**
     * Generates a secure invite code for an apiary
     * Restricted to OWNER of the apiary
     */
    async generateInviteCode(ownerId: string, apiaryId: string, role: 'WORKER' | 'VIEWER' = 'WORKER') {
        // 1. Verify Ownership
        const apiary = await prisma.apiary.findFirst({
            where: { id: apiaryId, ownerId }
        });
        if (!apiary) throw new Error('Unauthorized or Apiary not found');

        // 2. Generate Code (Simple 6-char logic for MVP, or JWT)
        // Using a temporary invite record logic or just a signed string
        // Ideally we store "ApiaryInvite" in DB, but for MVP let's store it in a simple way or return a token.
        // Let's create an Invite Record in DB? Schema doesn't have it explicitly but we have ApiaryMembership.

        // Better: Create a pre-filled membership with PENDING status and return the ID/AccessCode
        // OR: Use a signed JWT that contains { apiaryId, role, exp }

        return jwt.sign(
            { apiaryId, role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );
    }

    /**
     * Worker processes the invite code to join an apiary
     */
    async joinApiary(userId: string, inviteCode: string) {
        // 1. Verify signed JWT
        let payload: { apiaryId: string; role: string };
        try {
            payload = jwt.verify(inviteCode, config.jwt.secret) as { apiaryId: string; role: string };
        } catch (e) {
            if (e instanceof jwt.TokenExpiredError) throw new Error('Invite code has expired');
            throw new Error('Invalid or tampered invite code');
        }

        if (!payload.apiaryId) throw new Error('Invalid code structure');

        // 2. Create Membership
        const membership = await prisma.apiaryMembership.create({
            data: {
                apiaryId: payload.apiaryId,
                userId: userId,
                role: (payload.role as any) || 'WORKER',
                status: 'ACTIVE',
                joinedAt: new Date()
            }
        });

        // 3. Update User Role if needed (Explorer -> Worker)
        const user = await prisma.userProfile.findUnique({ where: { id: userId } });
        if (user?.userType === 'EXPLORER') {
            await prisma.userProfile.update({
                where: { id: userId },
                data: { userType: 'WORKER' }
            });
        }

        return membership;
    }

    /**
     * Google OAuth methods
     */
    async findByGoogleId(googleId: string) {
        return await prisma.userProfile.findFirst({
            where: { googleId }
        });
    }

    async linkGoogleAccount(userId: string, googleId: string) {
        return await prisma.userProfile.update({
            where: { id: userId },
            data: { googleId }
        });
    }

    async registerWithGoogle(data: { googleId: string; email: string; fullName: string; avatarUrl?: string; userType?: UserType }) {
        // Check if user exists by email first
        const existing = await prisma.userProfile.findFirst({
            where: { email: data.email }
        });

        if (existing) {
            // Link Google ID to existing user
            return await prisma.userProfile.update({
                where: { id: existing.id },
                data: { googleId: data.googleId }
            });
        }

        // Create new user
        return await userRepo.create({
            authId: `google_${data.googleId}`,
            email: data.email,
            fullName: data.fullName,
            role: data.userType || 'OWNER',
            avatarUrl: data.avatarUrl,
            googleId: data.googleId
        });
    }
}