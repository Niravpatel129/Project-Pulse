'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const initStarted = useRef(false);
  const { isAuthenticated, register, error, loading } = useAuth();

  const router = useRouter();

  // Ensure client-side only rendering with a single initialization
  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    // Set mounted state after first render
    setMounted(true);

    // Check if we need to redirect immediately - only if auth is ready
    if (isAuthenticated) {
      console.log('Register page: Already authenticated, preparing redirect');
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // If already authenticated, redirect to home
  // This is a separate effect to avoid execution during SSR
  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Validate auth context is available with super defensive check
    if (!mounted || !register || typeof register !== 'function') {
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength (simple check)
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Wrap register in a try-catch block in case the function exists but fails
      await register(email, password, name);
      // Redirect is handled by the useEffect
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Registration failed. The authentication system might be initializing. Please try again.',
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

  // Show initialization loading state if necessary
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4'></div>
          <div className='text-gray-600'>Loading authentication system...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>
            Create a new account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <Link href='/login' className='font-medium text-primary hover:text-primary/90'>
              sign in to your account
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label htmlFor='name' className='sr-only'>
                Full Name
              </label>
              <Input
                id='name'
                name='name'
                type='text'
                autoComplete='name'
                required
                placeholder='Full Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                autoComplete='new-password'
                required
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='confirm-password' className='sr-only'>
                Confirm Password
              </label>
              <Input
                id='confirm-password'
                name='confirmPassword'
                type='password'
                autoComplete='new-password'
                required
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {(errorMsg || (mounted && error)) && (
            <div className='text-red-500 text-sm text-center'>{errorMsg || error}</div>
          )}

          <div>
            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
