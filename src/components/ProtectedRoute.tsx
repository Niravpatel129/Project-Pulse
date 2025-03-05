import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during initial load
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      // router.push('/login');
      return;
    }

    // Check role-based access if requiredRole is specified
    if (requiredRole && user && user.role !== requiredRole) {
      // Role-based redirect
      if (requiredRole === 'admin') {
        // Regular users trying to access admin pages get redirected to home
        router.push('/');
      }
      // You could add more specific redirects for different scenarios here
    }
  }, [isAuthenticated, router, loading, user, requiredRole, pathname]);

  // Show nothing while loading
  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If role is required but user doesn't have it, don't render
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
