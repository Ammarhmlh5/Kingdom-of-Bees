import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

/**
 * RoleGuard - Protects routes based on user roles
 * Only users with allowed roles can access the protected content
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
    const { user, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (!allowedRoles.includes(user.userType)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and has required role
    return <>{children}</>;
};

/**
 * BeekeeperGuard - Shortcut for beekeeper routes
 * Allows OWNER and WORKER roles
 */
export const BeekeeperGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <RoleGuard allowedRoles={['OWNER', 'WORKER']}>
            {children}
        </RoleGuard>
    );
};

/**
 * OwnerGuard - For routes that require ownership
 * Allows OWNER role only
 */
export const OwnerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <RoleGuard allowedRoles={['OWNER']}>
            {children}
        </RoleGuard>
    );
};
