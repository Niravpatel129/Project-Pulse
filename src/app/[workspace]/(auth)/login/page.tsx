'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Default credentials for development mode
const DEV_CREDENTIALS = {
  email: 'niravpatelp129@gmail.com',
  password: 'admin@example.com',
};

// Local storage keys
const STORAGE_KEY = 'pulse_login_email';
const PASSWORD_STORAGE_KEY = 'pulse_login_password';

export default function LoginPage() {
  const isDev = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Use auth hook
  const { login, isAuthenticated, error, loading, reloadAuth } = useAuth();
  const router = useRouter();

  // Load saved email from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(STORAGE_KEY);
      const savedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY);

      if (savedEmail) {
        setEmail(savedEmail);
      } else if (isDev) {
        // Fall back to dev credentials if no saved email
        setEmail(DEV_CREDENTIALS.email);
        setPassword(DEV_CREDENTIALS.password);
      }

      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, [isDev]);

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

      // Save email to localStorage if remember me is checked
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, email);
        localStorage.setItem(PASSWORD_STORAGE_KEY, password);
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PASSWORD_STORAGE_KEY);
      }

      // Set success message
      setSuccessMsg('Login successful! Redirecting...');

      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.';
      setErrorMsg(message);
      setSuccessMsg('');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex scrollbar-hide overflow-hidden h-screen w-screen bg-white'>
      {/* Left side - Login form */}
      <div className='w-full md:w-2/5 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
        <div className='w-full max-w-sm space-y-6'>
          <div className='text-center'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>Login</h2>
          </div>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              <Input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                placeholder='Email'
                value={email}
                onChange={(e) => {
                  return setEmail(e.target.value);
                }}
                className='w-full'
              />

              <Input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Password'
                value={password}
                onChange={(e) => {
                  return setPassword(e.target.value);
                }}
                className='w-full'
              />

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='remember-me'
                  checked={rememberMe}
                  onCheckedChange={(checked) => {
                    return setRememberMe(checked as boolean);
                  }}
                />
                <label
                  htmlFor='remember-me'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Remember email
                </label>
              </div>
            </div>

            {(errorMsg || error) && <div className='text-red-500 text-sm'>{errorMsg || error}</div>}

            <Button
              type='submit'
              disabled={isLoading || (loading && !errorMsg && !error)}
              className='w-full'
            >
              {(isLoading || loading) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isLoading
                ? 'Signing in...'
                : loading && !errorMsg && !error
                ? 'Authenticating...'
                : successMsg && !errorMsg && !error
                ? 'Redirecting...'
                : 'Sign in'}
            </Button>
          </form>

          <div className='text-xs text-center text-gray-500 dark:text-gray-400 p-2 border-t pt-4'>
            <p className='font-medium text-gray-600 dark:text-gray-300 mb-1'>Demo accounts:</p>
            <p>
              admin@example.com or user@example.com
              <br />
              <span className='opacity-75'>(any password works)</span>
            </p>
          </div>

          {/* Debug info */}
          {isDev && (
            <div className='text-xs text-gray-500 border-t pt-4'>
              <p>Debug info:</p>
              <ul className='list-disc pl-4 mt-1'>
                <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
                <li>Loading: {loading ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Right side - Giant image */}
      <div className='hidden md:block md:w-3/5 relative overflow-hidden'>
        {/* Vintage effect overlay */}
        <div className='absolute inset-0 bg-gradient-to-br z-10'></div>
        <div className='absolute inset-0 bg-amber-900/10 mix-blend-multiply z-20'></div>
        <div className='absolute inset-0 bg-[url("/noise.png")] opacity-20 z-30'></div>
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-40'></div>
        <Image
          src='https://cdn.sanity.io/images/h6kk644c/production/0279e53df71f640092606d312d03e852758e3af2-1440x1080.jpg?w=1920&q=75&fit=clip&auto=format'
          alt='Login background'
          fill
          sizes='(max-width: 768px) 0vw, 60vw'
          priority
          className='object-cover'
        />
        <div className='absolute bottom-0 left-0 right-0 p-8 text-white z-50'></div>
      </div>
    </div>
  );
}
