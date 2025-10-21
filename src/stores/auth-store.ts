import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User, LoginRequest, LoginResponse, CreateUserRequest } from '@/types/api';
import { handleApiError } from '@/lib/api';

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: CreateUserRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;

  // Utilitários
  getAuthHeader: () => string | null;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<LoginResponse>('/sessions/password', credentials);
          const { user, token, refreshToken } = response;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Configura o header do axios para futuras requisições
          api.setAuthorizationHeader(token);

        } catch (error) {
          const apiError = handleApiError(error);
          set({
            error: apiError.message || 'Erro ao fazer login',
            isLoading: false,
            isAuthenticated: false,
          });
          throw apiError;
        }
      },

      // Registro
      register: async (userData: CreateUserRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ user: User; message: string }>('/users', userData);

          // Após registro, faz login automático
          await get().login({
            email: userData.email,
            password: userData.password,
          });

        } catch (error) {
          const apiError = handleApiError(error);
          set({
            error: apiError.message || 'Erro ao criar conta',
            isLoading: false,
            isAuthenticated: false,
          });
          throw apiError;
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });

        // Remove o header do axios
        api.removeAuthorizationHeader();

        // Limpa dados sensíveis do localStorage
        localStorage.removeItem('auth-storage');
      },

      // Refresh token
      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          throw new Error('No refresh token available');
        }

        try {
          const response = await api.post<{ token: string; refreshToken: string }>('/sessions/refresh', {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response;

          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });

          // Atualiza o header do axios
          api.setAuthorizationHeader(newToken);

        } catch (error) {
          // Se o refresh falhar, faz logout
          get().logout();
          throw error;
        }
      },

      // Limpar erro
      clearError: () => {
        set({ error: null });
      },

      // Atualizar dados do usuário
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      // Obter header de autenticação
      getAuthHeader: () => {
        const { token } = get();
        return token ? `Bearer ${token}` : null;
      },

      // Verificar se token está expirado
      isTokenExpired: () => {
        const { token } = get();
        if (!token) return true;

        try {
          // Decodifica o token JWT
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          return payload.exp < now;
        } catch {
          return true;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Partialize: apenas persistir dados essenciais
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Ao reidratar, verificar se o token ainda é válido
      onRehydrateStorage: () => (state) => {
        if (state && state.token && state.isTokenExpired()) {
          // Token expirado, limpar estado
          state.logout();
        }
      },
    }
  )
);

// Hook utilitário para verificar autenticação
export const useRequireAuth = () => {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    // Poderia redirecionar para login aqui
    throw new Error('User not authenticated');
  }

  return auth;
};

// Hook para obter usuário atual com segurança
export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return { user, isAuthenticated };
};

export default useAuthStore;