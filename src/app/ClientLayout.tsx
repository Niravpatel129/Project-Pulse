'use client';

import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppProvider>
        <div className='flex flex-col min-h-screen'>
          <Header />
          <main className='flex-1'>{children}</main>
        </div>
        <Toaster />
      </AppProvider>
    </>
  );
}
