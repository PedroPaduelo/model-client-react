import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { LoginRequest, CreateUserRequest, User } from '@/types/api';
import { handleApiError } from '@/lib/api';

// Hook de autenticação principal
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    updateUser,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    updateUser,
  };
}

// Hook para login
export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      await login(credentials);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

// Hook para registro
export function useRegister() {
  const { register } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      await register(userData);
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });
}

// Hook para logout
export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
  });
}

// Hook para obter perfil do usuário
export function useProfile() {
  const { updateUser } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<User>('/profile');
      updateUser(response);
      return response;
    },
    enabled: !!localStorage.getItem('auth-storage'), // Apenas se estiver autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}

// Hook para atualizar perfil
export function useUpdateProfile() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await api.put<User>('/profile', userData);
      updateUser(response);
      return response;
    },
    onSuccess: () => {
      // Invalida cache do perfil
      // queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Hook para recuperação de senha
export function useRecoverPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<{ message: string; expiresIn: number }>('/password/recover', {
        email,
      });
      return response;
    },
    onError: (error) => {
      console.error('Password recovery error:', error);
    },
  });
}

// Hook para reset de senha
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await api.post<{ message: string; success: boolean }>('/password/reset', data);
      return response;
    },
    onSuccess: () => {
      // Poderia redirecionar para login
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Password reset error:', error);
    },
  });
}

// Hook para verificação de autenticação
export function useAuthCheck() {
  const { isAuthenticated, token, isTokenExpired } = useAuthStore();

  const checkAuth = useCallback(() => {
    if (!token || isTokenExpired()) {
      return false;
    }
    return isAuthenticated;
  }, [isAuthenticated, token, isTokenExpired]);

  return {
    isAuthenticated: checkAuth(),
    isExpired: token ? isTokenExpired() : true,
  };
}

// Hook utilitário para requisições autenticadas
export function useAuthenticatedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: any
) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey,
    queryFn,
    enabled: isAuthenticated,
    ...options,
  });
}

// Hook utilitário para mutações autenticadas
export function useAuthenticatedMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: any
) {
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn,
    ...options,
  });
}

export default useAuth;