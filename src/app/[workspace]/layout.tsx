'use client';

import { Navigation } from '@/components/navigation/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const isPortalPage = pathname.includes('/portal');
  const isApprovalsPage = pathname.includes('/approvals');
  const showNavigation =
    !isAuthPage && !isPortalPage && (loading || isAuthenticated) && !isApprovalsPage;
  const isInvoicePage = pathname.includes('/invoices');
  const isProjectPage = pathname.includes('/');

  const isFullPage = true;

  return (
    <div className='flex min-h-screen flex-col'>
      {showNavigation && <Navigation />}

      {/* Main Content */}
      <main
        className={cn(
          'border-t flex-1 bg-[#eff6fd] p-3 pt-1 px-6 sm:p-4 sm:pt-2 md:px-10 md:py-1 lg:p-8 lg:pt-4 lg:px-12 xl:px-16',
          isFullPage && '!p-0',
        )}
      >
        {children}
      </main>
    </div>
  );
}
