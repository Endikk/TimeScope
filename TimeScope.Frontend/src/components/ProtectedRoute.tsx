import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de login en sauvegardant la destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles si spécifiés
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Rediriger vers une page non autorisée ou la page d'accueil
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
