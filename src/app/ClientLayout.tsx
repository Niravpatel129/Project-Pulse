'use client';

import ChatWidget from '@/components/chat/ChatWidget';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/contexts';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const pageContext = {
    path: pathname,
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <LoadingProvider>
            <TooltipProvider delayDuration={0}>
              <ReactTooltip id='my-tooltip' />

              <div className='flex flex-col min-h-screen relative'>
                {/* Main content area */}
                <main className='flex-1'>{children}</main>

                {/* Chat widget */}
                <ChatWidget />
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
