import { importProgress } from '@/app/[workspace]/database/[tableId]/importProgress';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * A floating progress overlay that stays visible during import regardless of dialog state
 */
export function ImportProgressOverlay() {
  const [progressData, setProgressData] = useState({
    progress: 0,
    status: '',
    isImporting: false,
  });

  // Monitor import progress
  useEffect(() => {
    const handleProgressUpdate = () => {
      console.log(
        'Progress overlay update:',
        importProgress.progress,
        importProgress.status,
        importProgress.isImporting,
      );

      // Always show if progress is > 0
      setProgressData({
        progress: importProgress.progress,
        status: importProgress.status,
        isImporting: importProgress.progress > 0,
      });
    };

    // Listen for progress updates from the import process
    window.addEventListener('import-progress-update', handleProgressUpdate);

    // Initial sync with global state
    handleProgressUpdate();

    return () => {
      window.removeEventListener('import-progress-update', handleProgressUpdate);
    };
  }, []);

  // Don't render anything when not importing
  if (!progressData.isImporting) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-hidden'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg border'>
        <h3 className='text-xl font-bold mb-4 text-center text-blue-600'>Importing Table...</h3>
        <div className='h-4 w-full bg-gray-100 rounded-full mb-4 overflow-hidden border'>
          <div
            className='h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out'
            style={{ width: `${progressData.progress}%` }}
          ></div>
        </div>
        <div className='flex justify-between mb-6 text-sm font-medium'>
          <span className='text-gray-700'>{progressData.progress}% complete</span>
          <span className='text-blue-600'>{progressData.status || 'Processing...'}</span>
        </div>

        {progressData.progress >= 100 ? (
          <div className='py-4 flex flex-col items-center justify-center'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100 text-green-600'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-10 w-10'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <p className='text-lg font-medium text-gray-800'>Import Complete!</p>
              <p className='text-sm text-gray-600 mt-1'>{progressData.status}</p>
              <p className='text-xs text-gray-500 mt-3'>Click below to view your new table:</p>
              <Button
                className='mt-4 bg-blue-600 hover:bg-blue-700 text-white'
                onClick={() => {
                  return importProgress.navigateToTable();
                }}
              >
                Go to New Table
              </Button>
            </div>
          </div>
        ) : (
          <div className='py-4 flex justify-center'>
            <div className='text-center'>
              <div className='flex items-center justify-center space-x-2 mb-4'>
                <div className='w-3 h-3 rounded-full bg-blue-600 animate-pulse'></div>
                <div className='w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-100'></div>
                <div className='w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-200'></div>
              </div>
              <FileSpreadsheet className='h-10 w-10 mx-auto mb-3 text-blue-600' />
              <p className='text-sm font-medium text-gray-800'>
                Please don&apos;t close this window
              </p>
              <p className='text-xs text-gray-500 mt-1'>Import process is running...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
