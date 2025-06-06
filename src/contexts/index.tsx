// Export context hooks and providers
export { ApiProvider, useApi } from './ApiContext';
export { InventoryProvider, useInventory } from './InventoryContext';
export { InvoicesProvider, useInvoices } from './InvoicesContext';
export { ProjectFilesProvider, useProjectFiles } from './ProjectFilesContext';
export { TemplatesProvider, useTemplates } from './TemplatesContext';
export { useWorkspace, WorkspaceProvider } from './WorkspaceContext';

// Combined provider for easier application wrapping
import React, { ReactNode } from 'react';
import { ApiProvider } from './ApiContext';
import { AuthProvider } from './AuthContext';
import { InventoryProvider } from './InventoryContext';
import { InvoicesProvider } from './InvoicesContext';
import { ProjectFilesProvider } from './ProjectFilesContext';
import { TemplatesProvider } from './TemplatesContext';
import { WorkspaceProvider } from './WorkspaceContext';

interface AppProviderProps {
  children: ReactNode;
  initialApiConfig?: Record<string, unknown>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialApiConfig }) => {
  return (
    <AuthProvider>
      <ApiProvider initialConfig={initialApiConfig}>
        <WorkspaceProvider>
          <ProjectFilesProvider>
            <InventoryProvider>
              <InvoicesProvider>
                <TemplatesProvider>{children}</TemplatesProvider>
              </InvoicesProvider>
            </InventoryProvider>
          </ProjectFilesProvider>
        </WorkspaceProvider>
      </ApiProvider>
    </AuthProvider>
  );
};
