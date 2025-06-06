'use client';

import { Button } from '@/components/ui/button';
import { Eye, Layout, Plus, Save } from 'lucide-react';
import { FC } from 'react';

interface MobileNavProps {
  isMobile: boolean;
  previewMode: boolean;
  showMobileNav: boolean;
  activeTab: string;
  setShowMobileNav: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setPreviewMode: (mode: boolean) => void;
  saveChanges: () => void;
  changesSaved: boolean;
}

export const MobileNav: FC<MobileNavProps> = ({
  isMobile,
  previewMode,
  showMobileNav,
  activeTab,
  setShowMobileNav,
  setActiveTab,
  setPreviewMode,
  saveChanges,
  changesSaved,
}) => {
  if (!isMobile || previewMode) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 z-30'>
      <Button
        variant={showMobileNav && activeTab === 'elements' ? 'default' : 'ghost'}
        size='icon'
        className='flex flex-col items-center gap-1 h-auto py-1 w-16'
        onClick={() => {
          setShowMobileNav(true);
          setActiveTab('elements');
        }}
      >
        <Plus className='h-5 w-5' />
        <span className='text-xs'>Elements</span>
      </Button>
      <Button
        variant={showMobileNav && activeTab === 'myform' ? 'default' : 'ghost'}
        size='icon'
        className='flex flex-col items-center gap-1 h-auto py-1 w-16'
        onClick={() => {
          setShowMobileNav(true);
          setActiveTab('myform');
        }}
      >
        <Layout className='h-5 w-5' />
        <span className='text-xs'>Form</span>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='flex flex-col items-center gap-1 h-auto py-1 w-16'
        onClick={() => {
          return setPreviewMode(true);
        }}
      >
        <Eye className='h-5 w-5' />
        <span className='text-xs'>Preview</span>
      </Button>
      <Button
        variant={changesSaved ? 'ghost' : 'default'}
        size='icon'
        className='flex flex-col items-center gap-1 h-auto py-1 w-16'
        onClick={saveChanges}
        disabled={changesSaved}
      >
        <Save className='h-5 w-5' />
        <span className='text-xs'>Save</span>
      </Button>
    </div>
  );
};
