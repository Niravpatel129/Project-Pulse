'use client';

import { useLoading } from '@/contexts/LoadingContext';

export function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        <p className='text-white'>Loading...</p>
      </div>
    </div>
  );
}
