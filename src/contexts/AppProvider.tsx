'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { ApiProvider } from './ApiContext';
import { AuthProvider } from './AuthContext';
import { InventoryProvider } from './InventoryContext';
import { InvoicesProvider } from './InvoicesContext';
import { ProjectFilesProvider } from './ProjectFilesContext';
import { TemplatesProvider } from './TemplatesContext';

interface AppProviderProps {
  children: ReactNode;
  initialApiConfig?: Record<string, unknown>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialApiConfig }) => {
  // Ensure client-side only execution for localStorage interactions
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Pre-initialize localStorage with default mock users if needed
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const mockUsersJson = localStorage.getItem('mock_users');
      if (!mockUsersJson) {
        const defaultUsers = [
          {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
          },
          {
            id: '2',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'user',
          },
        ];
        localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      }
    }
  }, []);

  // Provide a fallback during server-side rendering
  if (!isClient) {
    return (
      <AuthProvider>
        <div>{children}</div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ApiProvider initialConfig={initialApiConfig}>
        <ProjectFilesProvider>
          <InventoryProvider>
            <InvoicesProvider>
              <TemplatesProvider>{children}</TemplatesProvider>
            </InvoicesProvider>
          </InventoryProvider>
        </ProjectFilesProvider>
      </ApiProvider>
    </AuthProvider>
  );
};
