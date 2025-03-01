'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Default credentials for development mode
const DEV_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
};

export default function LoginPage() {
  const isDev = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState(isDev ? DEV_CREDENTIALS.email : '');
  const [password, setPassword] = useState(isDev ? DEV_CREDENTIALS.password : '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Use auth hook
  const { login, isAuthenticated, error, loading, reloadAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to home');
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted', { email, password });

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login successful');

      // Set success message
      setSuccessMsg('Login successful! Redirecting...');

      // Show success message
      toast.success('Login successful! Redirecting...');
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show nothing (will be redirected by useEffect)
  if (isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md space-y-8 text-center'>
          <div className='animate-pulse'>
            <h2 className='text-center text-2xl font-semibold text-green-600'>
              Already authenticated!
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>Redirecting to home page...</p>
          </div>
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

          {successMsg && <div className='text-green-500 text-sm text-center'>{successMsg}</div>}

          {(errorMsg || error) && (
            <div className='text-red-500 text-sm text-center'>{errorMsg || error}</div>
          )}

          <div>
            <Button
              type='submit'
              disabled={isLoading || loading || !!successMsg}
              className='w-full'
            >
              {isLoading
                ? 'Signing in...'
                : loading
                ? 'Authenticating...'
                : successMsg
                ? 'Redirecting...'
                : 'Sign in'}
            </Button>
          </div>

          <div className='text-sm text-center'>
            <p className='text-gray-600'>Demo credentials:</p>
            <p className='text-xs text-gray-500 mt-1'>
              Admin: admin@example.com (any password)
              <br />
              User: user@example.com (any password)
              <br />
              Additional: john@example.com, jane@example.com (any password)
            </p>
          </div>

          {/* Debug info */}
          {isDev && (
            <div className='mt-4 text-xs text-gray-500 border-t pt-4'>
              <p>Debug info:</p>
              <ul className='list-disc pl-4 mt-1'>
                <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
                <li>Loading: {loading ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
