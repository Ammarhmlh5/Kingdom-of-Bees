import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from './RoleGuard';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
    requireAuth?: boolean;
}

export function ProtectedRoute({
    children,
    allowedRoles = ['OWNER', 'WORKER', 'ADMIN', 'EXPLORER'],
    requireAuth = true
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-amber-700 font-bold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no role restrictions, just render
    if (!requireAuth || allowedRoles.length === 0) {
        return <>{children}</>;
    }

    // Apply role guard
    return (
        <RoleGuard allowedRoles={allowedRoles}>
            {children}
        </RoleGuard>
    );
}
