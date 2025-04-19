import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Save } from 'lucide-react';
import React, { useEffect } from 'react';

interface FormBuilderFooterProps {
  changesSaved: boolean;
  saveChanges: () => void;
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  isMobile: boolean;
}

const FormBuilderFooter: React.FC<FormBuilderFooterProps> = ({
  changesSaved,
  saveChanges,
  previewMode,
  setPreviewMode,
  isMobile,
}) => {
  // Set a CSS variable for footer height that parent layouts can use
  useEffect(() => {
    // Add the CSS variable to document root
    document.documentElement.style.setProperty('--footer-height', isMobile ? '0px' : '56px');

    return () => {
      // Clean up when component unmounts
      document.documentElement.style.removeProperty('--footer-height');
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <footer
      className={cn(
        'border-t p-2 md:p-4 flex items-center justify-between fixed bottom-0 z-50 backdrop-blur-sm w-full bg-white shadow-md left-0',
        changesSaved ? 'bg-gray-50/90' : 'bg-white/90',
      )}
      style={{ height: '56px', maxHeight: '56px', overflow: 'hidden' }}
    >
      <div className='flex items-center gap-2'>
        {changesSaved ? (
          <>
            <div className='h-5 md:h-6 w-5 md:w-6 rounded-full bg-green-100 flex items-center justify-center shadow-sm'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z'
                  fill='currentColor'
                  fillRule='evenodd'
                  clipRule='evenodd'
                  className='text-green-600'
                ></path>
              </svg>
            </div>
            <span className='text-xs md:text-sm text-gray-500 hidden sm:inline'>Changes saved</span>
          </>
        ) : (
          <span className='text-xs md:text-sm text-amber-600 font-medium'>Unsaved changes</span>
        )}
      </div>
      <div className='flex gap-2 md:gap-3'>
        {previewMode && (
          <Button
            variant='outline'
            onClick={() => {
              return setPreviewMode(false);
            }}
            className='rounded-full text-xs px-2 md:px-4 md:text-sm'
          >
            Exit Preview
          </Button>
        )}
        <Button
          className={cn(
            'rounded-full text-xs px-2 md:px-4 md:text-sm',
            changesSaved
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-green-600 hover:bg-green-700 text-white',
          )}
          onClick={saveChanges}
          disabled={changesSaved}
        >
          <Save className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
          <span className='hidden sm:inline'>Save Changes</span>
          <span className='sm:hidden'>Save</span>
        </Button>
      </div>
    </footer>
  );
};

export default FormBuilderFooter;
