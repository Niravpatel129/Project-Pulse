'use client';

import React, { ReactNode } from 'react';
import { ApiProvider } from './ApiContext';
import { InventoryProvider } from './InventoryContext';
import { InvoicesProvider } from './InvoicesContext';
import { ProjectFilesProvider } from './ProjectFilesContext';
import { TemplatesProvider } from './TemplatesContext';

interface AppProviderProps {
  children: ReactNode;
  initialApiConfig?: Record<string, unknown>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialApiConfig }) => {
  return (
    <ApiProvider initialConfig={initialApiConfig}>
      <ProjectFilesProvider>
        <InventoryProvider>
          <InvoicesProvider>
            <TemplatesProvider>{children}</TemplatesProvider>
          </InvoicesProvider>
        </InventoryProvider>
      </ProjectFilesProvider>
    </ApiProvider>
  );
};
