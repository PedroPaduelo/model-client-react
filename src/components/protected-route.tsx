import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = <Loading size="lg" />,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado, redireciona
    if (!isLoading && !isAuthenticated) {
      // Salva a localização atual para redirecionar após login
      navigate(redirectTo, {
        state: { from: location },
        replace: true
      });
    }
  }, [isAuthenticated, isLoading, navigate, location, redirectTo]);

  // Se estiver carregando, mostra o fallback
  if (isLoading) {
    return fallback;
  }

  // Se não estiver autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Se estiver autenticado, renderiza os filhos
  return <>{children}</>;
}

// Componente para redirecionar se já estiver autenticado
interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = '/dashboard'
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver autenticado, redireciona
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  // Se estiver carregando, mostra loading
  if (isLoading) {
    return <Loading size="lg" />;
  }

  // Se já estiver autenticado, não renderiza nada (vai redirecionar)
  if (isAuthenticated) {
    return null;
  }

  // Se não estiver autenticado, renderiza os filhos
  return <>{children}</>;
}

export default ProtectedRoute;