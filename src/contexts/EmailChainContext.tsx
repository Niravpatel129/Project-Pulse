import { useEmailChain } from '@/hooks/use-email-chain';
import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

interface EmailChainContextType {
  emailChain: ReturnType<typeof useEmailChain>['data'];
  isLoading: boolean;
  error: Error | null;
}

const EmailChainContext = createContext<EmailChainContextType | undefined>(undefined);

export function EmailChainProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const selectedEmailId = (params.selectedEmailId as string) || '0';
  const { data: emailChain, isLoading, error } = useEmailChain();

  return (
    <EmailChainContext.Provider value={{ emailChain, isLoading, error }}>
      {children}
    </EmailChainContext.Provider>
  );
}

export function useEmailChainContext() {
  const context = useContext(EmailChainContext);
  if (context === undefined) {
    throw new Error('useEmailChainContext must be used within an EmailChainProvider');
  }
  return context;
}
