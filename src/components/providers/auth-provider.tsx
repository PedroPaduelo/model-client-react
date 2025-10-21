import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, isAuthenticated, isTokenExpired, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Configura o header do axios quando o token mudar
    if (token && !isTokenExpired()) {
      api.setAuthorizationHeader(token);
    } else {
      api.removeAuthorizationHeader();
    }
  }, [token, isTokenExpired]);

  useEffect(() => {
    // Verifica se o token expirou periodicamente
    if (token && isTokenExpired()) {
      logout();
      navigate('/login', {
        state: { from: location },
        replace: true
      });
    }
  }, [token, isTokenExpired, logout, navigate, location]);

  // Adiciona interceptor para tratar erros 401 globalmente
  useEffect(() => {
    const setupAxiosInterceptor = () => {
      // O interceptor já foi configurado no arquivo api.ts
      // Aqui podemos adicionar lógica adicional se necessário
    };

    setupAxiosInterceptor();
  }, []);

  return <>{children}</>;
}

export default AuthProvider;