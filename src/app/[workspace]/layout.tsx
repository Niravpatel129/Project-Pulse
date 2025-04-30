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
      pathname &&
      !pathname.includes('/login') &&
      !pathname.includes('/register') &&
      !pathname.includes('/invoice/')
    ) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  const isPortalPage = pathname?.includes('/portal');
  const isApprovalsPage = pathname?.includes('/approvals');
  const isInvoiceNewPage = pathname?.includes('/invoices/new');
  const isInvoiceViewPage = pathname?.includes('/invoice/');
  const isPaymentSuccessPage = pathname?.includes('/payment-success');

  const showNavigation =
    !isAuthPage &&
    !isPortalPage &&
    (loading || isAuthenticated) &&
    !isApprovalsPage &&
    !isInvoiceNewPage &&
    !isInvoiceViewPage &&
    !isPaymentSuccessPage;

  const isLeadsPage = pathname?.includes('/leads');

  const isFullPage = true;

  return (
    <div className='flex flex-col'>
      {showNavigation && <Navigation />}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 bg-[#eff6fd] p-3 pt-1 px-6 sm:p-4 sm:pt-2 md:px-10 md:py-1 lg:p-8 lg:pt-4 lg:px-12 xl:px-16 overflow-auto',
          isFullPage && '!p-0',
          isLeadsPage && 'bg-white',
        )}
      >
        {children}
      </main>
    </div>
  );
}
