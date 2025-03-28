'use client';

import { Navigation } from '@/components/navigation/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Check if user is logged in
  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      !pathname.includes('/login') &&
      !pathname.includes('/register')
    ) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Check if the current path is login or register or portal
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const isPortalPage = pathname.includes('/portal');

  // Determine if we should show navigation
  const showNavigation = !isAuthPage && !isPortalPage && (loading || isAuthenticated);

  return (
    <div className='flex min-h-screen flex-col'>
      {showNavigation && <Navigation />}
      {/* Main Content */}
      <main className='flex-1 bg-[#eff6fd] p-3 pt-1 px-6 sm:p-4 sm:pt-2 sm:px-8 md:px-10 md:py-0 lg:p-8 lg:pt-4 lg:px-12 xl:px-16'>
        {children}
      </main>
    </div>
  );
}
