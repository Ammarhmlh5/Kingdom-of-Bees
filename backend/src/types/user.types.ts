export interface UserProfile {
    id: string;
    authId: string;
    email: string;
    fullName: string;
    userType: 'ADMIN' | 'EXPLORER' | 'OWNER' | 'WORKER';
    phone?: string;
    avatarUrl?: string;
    country?: string;
    region?: string;
    city?: string;
    language: string;
    timezone: string;
    subscriptionStatus: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    isVerified: boolean;
}

export interface UserWithPassword extends UserProfile {
    password: string;
}

export interface AuthTokenPayload {
    userId: string;
    email: string;
    userType: UserProfile['userType'];
}

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    userType?: UserProfile['userType'];
}

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}
