import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/sonner';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default AppProvider;