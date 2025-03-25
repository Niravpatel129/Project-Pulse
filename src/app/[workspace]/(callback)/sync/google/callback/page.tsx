'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { newRequest } from '@/utils/newRequest';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const scope = urlParams.get('scope');

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Google');
          return;
        }

        console.log('Received authorization code:', code);
        console.log('Received scope:', scope);

        const response = await newRequest.post('/calendar/google/callback', {
          code,
          scope,
          redirectUri: `${window.location.origin}/sync/google/callback`,
        });

        const data = response.data;

        // Store tokens in localStorage
        localStorage.setItem('google_calendar_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('google_calendar_refresh_token', data.refresh_token);
        }

        setStatus('success');
        setMessage('Successfully authenticated with Google Calendar!');

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Error handling Google callback:', error);
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'Failed to process Google authentication',
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-center'>
            {status === 'loading' && 'Connecting to Google Calendar'}
            {status === 'success' && 'Connection Successful'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          {status === 'loading' && (
            <div className='flex flex-col items-center gap-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-muted-foreground'>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div className='space-y-4'>
              <p className='text-muted-foreground'>{message}</p>
              <p className='text-sm text-muted-foreground'>
                Redirecting you back to the application...
              </p>
            </div>
          )}
          {status === 'error' && <p className='text-muted-foreground'>{message}</p>}
        </CardContent>
        {status === 'error' && (
          <CardFooter className='flex justify-center'>
            <Button
              onClick={() => {
                return router.push('/');
              }}
            >
              Return to Application
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
