'use client';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/contexts';
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
          <TooltipProvider>
            <div className='flex flex-col min-h-screen'>
              <main className='flex-1'>{children}</main>
            </div>
          </TooltipProvider>
          <Toaster />
        </AppProvider>
      </QueryClientProvider>
    </>
  );
}
