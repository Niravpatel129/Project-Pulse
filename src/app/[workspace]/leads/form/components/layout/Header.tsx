'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Eye, HelpCircle, Menu, Settings } from 'lucide-react';
import { FC } from 'react';

interface HeaderProps {
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  isMobile: boolean;
  setShowMobileMenu: (show: boolean) => void;
  showMobileMenu: boolean;
}

export const Header: FC<HeaderProps> = ({
  previewMode,
  setPreviewMode,
  isMobile,
  setShowMobileMenu,
  showMobileMenu,
}) => {
  return (
    <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm w-full'>
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
