'use client';

import { ApiProvider } from '@/contexts/ApiContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectFilesProvider } from '@/contexts/ProjectFilesContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <ProjectFilesProvider>{children}</ProjectFilesProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ApiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
