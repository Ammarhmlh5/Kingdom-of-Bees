
import { UserProfile, UserType } from '@prisma/client';

import prisma from '../config/prisma';

export class UserRepository {
    async findByAuthId(authId: string): Promise<UserProfile | null> {
        return prisma.userProfile.findUnique({
            where: { authId }
        });
    }

    async findByEmail(email: string): Promise<UserProfile | null> {
        return prisma.userProfile.findUnique({
            where: { email }
        });
    }

    async create(data: {
        authId: string;
        email: string;
        fullName: string;
        role?: UserType;
        password?: string;
        googleId?: string;
        avatarUrl?: string;
    }): Promise<UserProfile> {
        return prisma.userProfile.create({
            data: {
                authId: data.authId,
                email: data.email,
                fullName: data.fullName,
                userType: data.role || 'EXPLORER',
                password: data.password,
                avatarUrl: data.avatarUrl,
                // Default settings
                notificationSettings: {
                    create: {} // Default settings
                }
            }
        });
    }

    async updateRole(userId: string, role: UserType): Promise<UserProfile> {
        return prisma.userProfile.update({
            where: { id: userId },
            data: { userType: role }
        });
    }
}
