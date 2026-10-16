// components/ProtectedRoute.tsx
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: 'creator' | 'student';
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se tem o role necessário
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Redirecionamento automático baseado no role
  if (!requiredRole) {
    if (user.role === 'creator' && location.pathname === '/') {
      return <Navigate to="/dashboard" replace />;
    }
    if (user.role === 'student' && location.pathname === '/') {
      return <Navigate to="/aluno/feed" replace />;
    }
  }

  return <>{children}</>;
}