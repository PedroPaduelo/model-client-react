import { ReactNode } from 'react';
import { QueryClientProvider, QueryClient, focusManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { handleGlobalError } from '@/lib/query-client';

interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
}

export function QueryProvider({ children, client = queryClient }: QueryProviderProps) {
  // Configuração do focus manager para melhor performance
  focusManager.setEventListener((handleFocus) => {
    // Adicionar event listener para quando a janela ganha foco
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus, false);
      return () => {
        window.removeEventListener('focus', handleFocus, false);
      };
    }
    return () => {};
  });

  // Configuração para tratamento global de erros
  const defaultOptions = {
    queries: {
      retry: (failureCount, error) => {
        // Tratamento específico de erros
        handleGlobalError(error, 'query');

        // Lógica de retry padrão
        if (failureCount >= 3) return false;
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const apiError = error as any;
          if (apiError.statusCode === 401 || apiError.statusCode === 403) {
            return false;
          }
        }
        return true;
      },
      refetchOnWindowFocus: import.meta.env.PROD ? false : true,
    },
    mutations: {
      onError: (error) => {
        handleGlobalError(error, 'mutation');
      },
    },
  };

  const customClient = client ?? queryClient;

  return (
    <QueryClientProvider client={customClient} defaultOptions={defaultOptions}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;