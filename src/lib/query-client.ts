import { QueryClient } from '@tanstack/react-query';
import { handleApiError, isNetworkError, isTimeoutError } from './api';

// Configuração do QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Não tentar novamente para erros de autenticação
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const apiError = error as any;
          if (apiError.statusCode === 401) {
            return false;
          }
        }

        // Não tentar novamente para erros de rede
        if (isNetworkError(error)) {
          return false;
        }

        // Limitar a 3 tentativas
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false, // Não lançar erros para permitir tratamento manual
    },
    mutations: {
      retry: 1,
      throwOnError: false, // Não lançar erros para permitir tratamento manual
    },
  },
});

// Função para tratamento global de erros
export function handleGlobalError(error: unknown, context?: string) {
  const apiError = handleApiError(error);

  console.error(`Global Error ${context ? `(${context})` : ''}:`, {
    error: apiError.error,
    message: apiError.message,
    statusCode: apiError.statusCode,
    details: apiError.details,
  });

  // Aqui você poderia integrar com um serviço de monitoramento
  // como Sentry, LogRocket, etc.

  return apiError;
}

// Função para notificar o usuário sobre erros
export function notifyError(error: unknown, context?: string) {
  const apiError = handleApiError(error);

  // Aqui você pode usar um sistema de notificações
  // Ex: toast.error(apiError.message)

  // Por enquanto, apenas log no console
  console.error(`Error Notification ${context ? `(${context})` : ''}:`, apiError);

  return apiError;
}

// Hook para tratamento de erros em queries
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    const apiError = handleApiError(error);

    // Tratamento específico baseado no status code
    switch (apiError.statusCode) {
      case 401:
        // Erro de autenticação - redirecionar para login
        // window.location.href = '/login';
        console.warn('Unauthorized - redirecting to login');
        break;

      case 403:
        // Erro de permissão
        console.warn('Forbidden - insufficient permissions');
        break;

      case 404:
        // Recurso não encontrado
        console.warn('Resource not found');
        break;

      case 429:
        // Rate limit
        console.warn('Too many requests - rate limited');
        break;

      case 500:
        // Erro do servidor
        console.error('Server error:', apiError.message);
        break;

      default:
        console.error('API Error:', apiError.message);
    }

    return apiError;
  }, []);

  return { handleError };
}

// Configuração para logging em desenvolvimento
export function setupQueryLogging() {
  if (import.meta.env.DEV) {
    // Log de queries
    queryClient.setQueryDefaults(['*'], {
      onSuccess: (data, query) => {
        console.log(`Query Success [${query.queryKey.join(', ')}]:`, data);
      },
      onError: (error, query) => {
        console.error(`Query Error [${query.queryKey.join(', ')}]:`, error);
      },
    });

    // Log de mutations
    queryClient.setMutationDefaults(['*'], {
      onSuccess: (data, variables, context, mutation) => {
        console.log(`Mutation Success [${mutation.mutationId}]:`, data);
      },
      onError: (error, variables, context, mutation) => {
        console.error(`Mutation Error [${mutation.mutationId}]:`, error);
      },
    });
  }
}

export default queryClient;