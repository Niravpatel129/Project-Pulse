'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Safely extract auth context values with fallbacks
  const auth = useAuth();
  const { login, isAuthenticated = false, error: authError = null } = auth || {};

  const router = useRouter();

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // If already authenticated, redirect to home or previous attempted page
  useEffect(() => {
    if (mounted && isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Super defensive check for login function
    if (!login || typeof login !== 'function') {
      setErrorMsg('Authentication system not available');
      setIsLoading(false);
      toast({
        title: 'Error',
        description:
          'Authentication system not available. Please try again later or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Wrap login in a try-catch block in case the function exists but fails
      await login(email, password);
      // Redirect is handled by the useEffect
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Login failed. The authentication system might be initializing. Please try again.',
      );

      // Provide helpful feedback if auth context is not ready
      if (err instanceof Error && err.message.includes('Auth context not available')) {
        toast({
          title: 'System Initializing',
          description:
            'The authentication system is still initializing. Please wait a moment and try again.',
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during server rendering or initial client hydration
  if (!mounted) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-pulse text-center'>
          <div className='h-8 w-32 bg-gray-200 mx-auto mb-4 rounded'></div>
          <div className='h-4 w-48 bg-gray-200 mx-auto rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <Link href='/register' className='font-medium text-primary hover:text-primary/90'>
              create a new account
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <Input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {(errorMsg || authError) && (
            <div className='text-red-500 text-sm text-center'>{errorMsg || authError}</div>
          )}

          <div>
            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className='text-sm text-center'>
            <p className='text-gray-600'>Demo credentials:</p>
            <p className='text-xs text-gray-500 mt-1'>
              Admin: admin@example.com (any password)
              <br />
              User: user@example.com (any password)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
