import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bee-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-honey border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-bee-muted">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
