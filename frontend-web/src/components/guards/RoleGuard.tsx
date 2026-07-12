import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = '/access-denied' }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-amber-700 font-bold">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    // User not authenticated - should be handled by ProtectedRoute
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user's role is in allowed roles
    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    // User has access - render children
    return <>{children}</>;
}
