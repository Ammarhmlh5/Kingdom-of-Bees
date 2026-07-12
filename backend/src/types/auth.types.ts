
export type UserRole = 'OWNER' | 'WORKER' | 'ADMIN';

export interface AuthUser {
    id: string; // UserProfile ID
    authId: string; // Supabase Auth ID
    email: string;
    role: UserRole;
    permissions?: string[]; // For granular worker permissions
}

export interface AuthenticatedRequest extends Express.Request {
    user?: AuthUser;
    apiaryId?: string; // If in apiary scope
}
