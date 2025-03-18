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

  // Check if the current path is login or register
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  // Determine if we should show navigation
  const showNavigation = !isAuthPage && (loading || isAuthenticated);

  return (
    <div className='flex min-h-screen flex-col'>
      {showNavigation && <Navigation />}
      {/* Main Content */}
      <main className='flex-1 p-3 sm:p-4 md:p-0 lg:p-8'>{children}</main>
    </div>
  );
}
