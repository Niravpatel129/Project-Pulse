'use client';
import { ApiProvider } from '@/contexts/ApiContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { InvoicesProvider } from '@/contexts/InvoicesContext';
import { ProjectFilesProvider } from '@/contexts/ProjectFilesContext';
import { TemplatesProvider } from '@/contexts/TemplatesContext';

export default function Test({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ApiProvider>
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
}
