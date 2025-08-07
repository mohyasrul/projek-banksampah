import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Akun Tidak Aktif</h2>
            <p className="text-sm">
              Akun Anda sedang tidak aktif. Silakan hubungi administrator untuk mengaktifkan akun.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <h2 className="font-semibold mb-2">Akses Ditolak</h2>
            <p className="text-sm">
              Anda tidak memiliki izin untuk mengakses halaman ini. 
              Diperlukan role: <strong>{requiredRole}</strong>
            </p>
          </div>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
