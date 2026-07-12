import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

/**
 * AdminGuard - Protects admin routes
 * Only users with ADMIN role can access
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    
    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    // Redirect to admin login if not authenticated
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }
    
    // Check if user is admin
    if (user.userType !== 'ADMIN') {
        return <Navigate to="/admin/unauthorized" replace />;
    }
    
    // User is authenticated and is admin
    return <>{children}</>;
};
