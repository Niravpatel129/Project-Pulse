// Export context hooks and providers
export { ApiProvider, useApi } from './ApiContext';
export { AuthProvider, useAuth } from './AuthContext';
export type { User } from './AuthContext';
export { InventoryProvider, useInventory } from './InventoryContext';
export { InvoicesProvider, useInvoices } from './InvoicesContext';
export { ProjectFilesProvider, useProjectFiles } from './ProjectFilesContext';
export { TemplatesProvider, useTemplates } from './TemplatesContext';

// Export the combined provider
export { AppProvider } from './AppProvider';
