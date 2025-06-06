import { useEmailChain } from '@/hooks/use-email-chain';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

interface EmailChainContextType {
  emailChain: ReturnType<typeof useEmailChain>['data'];
  isLoading: boolean;
  error: Error | null;
  prefetchEmailChain: (threadId: string) => void;
}

const EmailChainContext = createContext<EmailChainContextType | undefined>(undefined);

export function EmailChainProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const selectedEmailId = (params.selectedEmailId as string) || '0';
  const { data: emailChain, isLoading, error } = useEmailChain();
  const queryClient = useQueryClient();

  const prefetchEmailChain = (threadId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['email-chain', threadId],
      queryFn: async () => {
        const response = await newRequest.get(`/inbox/${threadId}`);
        return response.data;
      },
    });
  };

  return (
    <EmailChainContext.Provider value={{ emailChain, isLoading, error, prefetchEmailChain }}>
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
