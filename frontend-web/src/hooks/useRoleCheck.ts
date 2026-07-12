import { useAuth } from '@/contexts/AuthContext';

export function useRoleCheck(allowedRoles: string[]) {
    const { user, isLoading } = useAuth();

    const hasAccess = user ? allowedRoles.includes(user.role) : false;
    const userRole = user?.role;

    return {
        hasAccess,
        isLoading,
        userRole,
        isOwner: userRole === 'OWNER',
        isWorker: userRole === 'WORKER',
        isAdmin: userRole === 'ADMIN'
    };
}
