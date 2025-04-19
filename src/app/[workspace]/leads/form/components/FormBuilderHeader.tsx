import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Eye, HelpCircle, Menu, Settings } from 'lucide-react';
import React from 'react';

interface FormBuilderHeaderProps {
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  isMobile: boolean;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({
  previewMode,
  setPreviewMode,
  isMobile,
  showMobileMenu,
  setShowMobileMenu,
}) => {
  return (
    <header className='border-b bg-white/80 backdrop-blur-sm  z-20 shadow-sm w-full'>
      <div className='flex items-center px-4 md:px-6 h-14 md:h-16'>
        <Button
          variant='ghost'
          size='icon'
          className='mr-2 md:mr-3 text-gray-500 hover:text-gray-700'
          onClick={() => {
            return isMobile ? setShowMobileMenu(!showMobileMenu) : null;
          }}
        >
          {isMobile ? <Menu className='h-5 w-5' /> : <ArrowLeft className='h-5 w-5' />}
        </Button>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <span className='font-medium text-gray-800 text-base md:text-lg tracking-tight'>
              Form Builder
            </span>
            <span className='text-gray-400 hidden sm:inline'>/</span>
            <span className='text-gray-600 text-sm hidden sm:inline'>College Intake Form</span>
          </div>
        </div>
        <div className='ml-auto flex items-center gap-2 md:gap-3'>
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              return setPreviewMode(!previewMode);
            }}
            className='gap-1 md:gap-2 rounded-full px-2 md:px-4 text-xs'
          >
            {previewMode ? (
              <Edit2 className='h-3 w-3 md:h-4 md:w-4' />
            ) : (
              <Eye className='h-3 w-3 md:h-4 md:w-4' />
            )}
            <span className='hidden sm:inline'>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
          >
            <Settings className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
          >
            <HelpCircle className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default FormBuilderHeader;
