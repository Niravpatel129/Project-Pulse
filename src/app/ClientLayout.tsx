'use client';

import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Track if component is mounted to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Pre-initialize auth to ensure it's available
  const auth = useAuth();

  useEffect(() => {
    // Mark as mounted after initial render
    setMounted(true);

    // Mark auth as initialized after a brief delay to ensure context is ready
    const timer = setTimeout(() => {
      setAuthInitialized(true);
      console.log('Auth initialized, authenticated:', auth.isAuthenticated);
    }, 100); // Short delay to ensure context has time to initialize

    return () => clearTimeout(timer);
  }, [auth.isAuthenticated]);

  // If not mounted or auth not initialized, show simple layout without interactive elements
  if (!mounted || !authInitialized) {
    return (
      <>
        <div className='flex flex-col min-h-screen'>
          <div className='border-b'>
            <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
              <div className='font-semibold text-lg'>Pulse App</div>
              <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse'></div>
            </div>
          </div>
          <main className='flex-1'>
            {/* Show children even during initialization for better UX */}
            {children}
          </main>
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-1'>{children}</main>
      </div>
      <Toaster />
    </>
  );
}
