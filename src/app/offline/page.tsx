'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [workspace, setWorkspace] = useState<string>('');

  useEffect(() => {
    // Extract workspace from hostname when client-side code runs
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    // If not on localhost, set the workspace name
    if (hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app') {
      setWorkspace(subdomain);
    }
  }, []);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12'>
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>You&apos;re Offline</h1>

        {workspace && (
          <p className='text-lg text-blue-600 font-medium mb-6'>{workspace} Workspace</p>
        )}

        <p className='text-gray-600 mb-8'>
          It looks like you&apos;ve lost your internet connection. Some features may be unavailable
          until you&apos;re back online.
        </p>

        <div className='space-y-4'>
          <button
            onClick={() => {
              return window.location.reload();
            }}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
          >
            Try Again
          </button>

          <Link
            href='/'
            className='block w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
