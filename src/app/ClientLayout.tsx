'use client';

import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/contexts';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <LoadingProvider>
            <TooltipProvider delayDuration={0}>
              <div className='flex flex-col min-h-screen'>
                <main className='flex-1'>{children}</main>
              </div>
            </TooltipProvider>
            <LoadingOverlay />
          </LoadingProvider>
          <Toaster />
        </AppProvider>
      </QueryClientProvider>
    </>
  );
}
