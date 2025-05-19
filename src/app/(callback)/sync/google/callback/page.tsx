'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { newRequest } from '@/utils/newRequest';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function GoogleCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const code = searchParams.get('code');
        const scope = searchParams.get('scope');
        const state = searchParams.get('state');
        const service = state?.includes('gmail') ? 'gmail' : 'calendar';

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Google');
          return;
        }

        console.log(`Received authorization code for ${service}:`, code);
        console.log('Received scope:', scope);

        const response = await newRequest.post('/gmail/connect', {
          code,
          scope,
          redirectUri: `www.hourblock.com/sync/google/callback`,
        });

        const data = response.data;

        // Handle success differently based on service
        if (service === 'gmail') {
          setStatus('success');
          setMessage('Successfully connected Gmail!');

          // If this is a popup window, notify the opener and close
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'GMAIL_AUTH_SUCCESS', email: data.email },
              window.location.origin,
            );
            // Close this window after a short delay
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            // Navigate back if not a popup
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else {
          // Original calendar flow
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
        }
      } catch (error) {
        console.error('Error handling Google callback:', error);
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'Failed to process Google authentication',
        );

        // If this is a popup window for Gmail, notify the opener of failure
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'GMAIL_AUTH_ERROR', error: message },
            window.location.origin,
          );
          // Still close the window after a short delay
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [router, searchParams, message]);

  return (
    <div className='w-full flex items-center justify-center min-h-screen p-4 bg-background'>
      <Card className='w-full max-w-md border-0 shadow-none bg-background'>
        <CardHeader>
          <CardTitle className='text-center'>
            {status === 'loading' && 'Connecting to Google Services'}
            {status === 'success' && 'Connection Successful'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center bg-background'>
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
                {window.opener
                  ? 'This window will close automatically...'
                  : 'Redirecting you back to the application...'}
              </p>
            </div>
          )}
          {status === 'error' && <p className='text-muted-foreground'>{message}</p>}
        </CardContent>
        {status === 'error' && !window.opener && (
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

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className='w-full flex items-center justify-center min-h-screen p-4 bg-background'>
          <Card className='w-full max-w-md border-0 shadow-none bg-background'>
            <CardHeader>
              <CardTitle className='text-center'>Connecting to Google Services</CardTitle>
            </CardHeader>
            <CardContent className='text-center bg-background'>
              <div className='flex flex-col items-center gap-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-muted-foreground'>Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
